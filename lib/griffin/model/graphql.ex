defmodule Griffin.Model.GraphQL do
  @moduledoc """
  Module for converting models to graphql.
  """

  @doc """
  Converts a list of models into a plug that can be used to serve GraphQL
  with GraphiQL.
  """
  def plugify(conn, schema) do
    opts = Absinthe.Plug.init schema: schema
    Absinthe.Plug.call conn, opts
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
    id = UUID.uuid4 :hex
    model = List.first models
    code = """
      defmodule Griffin.Model.Runtime.Types#{id} do
        use Absinthe.Schema.Notation
        #{model_to_types model}
      end
      defmodule Griffin.Model.Runtime.Schema#{id} do
        use Absinthe.Schema
        import_types Griffin.Model.Runtime.Types#{id}
        query do
          #{model_to_field model, :read}
          #{model_to_field model, :list}
        end
        mutation do
          #{model_to_field model, :create}
          #{model_to_field model, :update}
          #{model_to_field model, :delete}
        end
      end
    """
    Code.compile_string code
    Module.concat ["Griffin.Model.Runtime.Schema#{id}"]
  end

  defp model_to_field(model, crud_op) do
    {singular, plural} = Griffin.Model.Module.namespaces model
    field_name = case crud_op do
      :create -> "create_#{singular}"
      :read -> singular
      :update -> "update_#{singular}"
      :delete -> "delete_#{singular}"
      :list -> plural
    end
    type_name = if crud_op == :list do
      "list_of(:#{singular})"
    else
      ":#{singular}"
    end
    """
    field :#{field_name}, #{type_name} do
      #{model_to_args model, crud_op}
      resolve fn (args, _) ->
        model = #{inspect model}
        {:ok, Griffin.Model.Module.resolve(model, :#{crud_op}, args).res}
      end
    end
    """
  end

  defp model_to_args(model, crud_op) do
    {name, _} = Griffin.Model.Module.namespaces model
    dsl = Griffin.Model.DSL.for_crud_op model.fields, crud_op
    fields = for {attr, [type | _]} <- dsl do
      type = case type do
        :map -> "#{name}_input_#{attr}"
        :int -> :integer
        _ -> type
      end
      "arg :#{attr}, :#{type}"
    end
    Enum.join fields, "\n"
  end

  defp model_to_types(model) do
    {singular, _} = Griffin.Model.Module.namespaces model
    dsl = Griffin.Model.DSL.for_crud_op model.fields, :read
    dsl_to_objects(singular, dsl) <>
    dsl_to_objects(singular, dsl, true)
  end

  defp dsl_to_objects(name, dsl, is_input \\ false) do
    prefix = if is_input, do: "input_object", else: "object"
    suffix = if is_input and not already_namespaced(name) do
      "#{name}_input"
    else
      name
    end
    """
     #{prefix} :#{suffix} do
      #{to_fields name, dsl, is_input}
    end
    #{extract_map_objs name, dsl, is_input}
    """
  end

  defp already_namespaced(name) do
    String.contains? to_string(name), "_input"
  end

  defp object_name(name, attr, is_input) do
    if is_input and not already_namespaced(name) do
      "#{name}_input_#{attr}"
    else
      "#{name}_#{attr}"
    end
  end

  defp to_fields(name, dsl, is_input) do
    fields = for {attr, [type | _]} <- dsl do
      type = case type do
        :map -> object_name(name, attr, is_input)
        :int -> :integer
        _ -> type
      end
      "field :#{attr}, :#{type}"
    end
    Enum.join fields, "\n  "    
  end

  defp extract_map_objs(name, dsl, is_input) do
    maps_dsl = Enum.filter dsl, fn ({_, [type | _]}) -> type == :map end
    for {attr, [_ | rules]} <- maps_dsl do
      {_, dsl} = rules
      |> Enum.filter(fn ({rule_name, _}) -> rule_name == :of end)
      |> List.first
      dsl_to_objects object_name(name, attr, is_input), dsl, is_input
    end
  end
end