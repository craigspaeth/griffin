defmodule Griffin.Model.GraphQL do
  @moduledoc """
  Module for converting models to graphql.
  """

  @doc """
  Converts a list of models into a plug that can be used to serve GraphQL
  with GraphiQL.
  """
  def plugify(conn, schema) do
    opts = GraphQL.Plug.init schema: {schema, :schema}
    GraphQL.Plug.call conn, opts
  end

  @doc """
  Runs a GraphQL query string against a given schema module
  """
  def run(query, schema) do
    Absinthe.run query, schema
  end

  @doc """
  Converts a list of model modules into a single Absinthe schema module that
  can be sent to `Absinthe.run`.
  """
  def schemaify(models) do
    id = UUID.uuid4(:hex)
    model = List.first models
    {singular, plural} = Griffin.Model.Module.namespaces model
    {uppercase, uppercases} = {
      String.capitalize(to_string singular),
      String.capitalize(to_string plural)
    }
    code = """
      defmodule Griffin.Model.Runtime.Types#{id} do
        use Absinthe.Schema.Notation
        #{dsl_to_fields model, :read}
        #{dsl_to_fields model, :list}
      end
      defmodule Griffin.Model.Runtime.Schema#{id} do
        use Absinthe.Schema
        import_types Griffin.Model.Runtime.Types#{id}
        query do
          field :#{singular}, :#{singular} do
            resolve fn (args, _) ->
              model = #{inspect model}
              {:ok, Griffin.Model.Module.resolve(model, :read, args).res}
            end
          end
          field :#{plural}, list_of(:#{plural}) do
            resolve fn (args, _) ->
              model = #{inspect model}
              {:ok, Griffin.Model.Module.resolve(model, :list, args).res}
            end
          end
        end
      end
    """
    IO.puts code
    Code.compile_string code
    Module.concat ["Griffin.Model.Runtime.Schema#{id}"]
  end

  defp dsl_to_fields(model, crud_op) do
    {singular, plural} = Griffin.Model.Module.namespaces model
    dsl = Griffin.Model.DSL.for_crud_op model.fields, crud_op
    dsl_to_objects singular, dsl
  end

  defp dsl_to_objects(name, dsl) do

    # Recursively pull out all of the :map types into objects
    maps_dsl = Enum.filter dsl, fn ({_, [type | _]}) -> type == :map end
    map_objs = for {attr, [type | rules]} <- maps_dsl do
      {_, dsl} = rules
      |> Enum.filter(fn ({rule_name, _}) -> rule_name == :of end)
      |> List.first
      dsl_to_objects "#{name}_#{attr}", dsl
    end

    # Convert the first level of attrs into Absinthe fields
    fields = for {attr, [type | rules]} <- dsl do
      type = if type == :map do
        "#{name}_#{attr}"
      else
        type
      end
      "field :#{attr}, :#{type}"
    end
    fields = Enum.join fields, "\n  "
    """
    object :#{name} do
      #{fields}
    end
    #{map_objs}
    """
  end
end