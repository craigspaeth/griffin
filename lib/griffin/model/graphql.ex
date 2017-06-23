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
  Converts a Griffin fields DSL into a CRUD map of query/mutation GraphQL
  schemas that can be composed through `graphqlize` and run
  through `GraphQL.execute`.

  ## Parameters

    - namespace: Atom of the model's namespace e.g. :user
    - fields: Keyword List DSL describing the model's fields
    - create: Function for create GraphQL schema resolver
    - read: Function for read GraphQL schema resolver
    - update: Function for update GraphQL schema resolver
    - delete: Function for delete GraphQL schema resolver
    - list: Function for list GraphQL schema resolver
    - returns: String of JSON to be sent to the user


  ## Example

    iex> schema = Griffin.Model.[ |> fields_to_graphql(me: [:string]]
    iex> GraphQL.execute schema, "{ name }"
    {:ok, %{data: %{"name" => "Harry Potter"}}}

  """
  def to_graphql_map(
    namespaces: namespaces,
    fields: fields,
    create: create,
    read: read,
    update: update,
    delete: delete,
    list: list
  ) do
    {singular, plural} = namespaces
    # Read Query
    read_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "#{String.capitalize to_string singular}QueryType",
        fields: fields |> fields_to_graphql(:read)
      },
      resolve: read,
      args: fields |> fields_to_graphql(:read)
    }
    # List Query
    list_field = %{
      type: %GraphQL.Type.List{ofType: %GraphQL.Type.ObjectType{
        name: "#{String.capitalize to_string plural}ListQueryType",
        fields: fields |> fields_to_graphql(:list)
      }},
      resolve: list,
      args: fields |> fields_to_graphql(:list)
    }
    # Create Mutation
    create_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "Create#{String.capitalize to_string singular}MutationType",
        fields: fields |> fields_to_graphql(:create)
      },
      resolve: create,
      args: fields |> fields_to_graphql(:create)
    }
    # Delete Mutation
    delete_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "Delete#{String.capitalize to_string singular}MutationType",
        fields: fields |> fields_to_graphql(:delete)
      },
      resolve: delete,
      args: fields |> fields_to_graphql(:delete)
    }
    # Update Mutation
    update_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "Update#{String.capitalize to_string singular}MutationType",
        fields: fields |> fields_to_graphql(:update)
      },
      resolve: update,
      args: fields |> fields_to_graphql(:update)
    }
    # Compose CRUDL schemas into a map of query/mutation GraphQL schemas
    %{
      query: %{
        String.to_atom "#{singular}" => read_field,
        String.to_atom "#{plural}" => list_field
      },
      mutation: %{
        String.to_atom "create_#{singular}" => create_field,
        String.to_atom "update_#{singular}" => update_field,
        String.to_atom "delete_#{singular}" => delete_field
      }
    }
  end

  # Converts a fields dsl into a map of GraphQL types
  defp fields_to_graphql(dsl, crud_op) do
    dsl = Griffin.Model.DSL.for_crud_op dsl, crud_op
    fields = for {attr, [type | rules]} <- dsl do
      graphql_type = cond do
        Enum.member?(rules, :required) ->
          %GraphQL.Type.NonNull{ofType: %GraphQL.Type.String{}}
        type == :string ->
          %GraphQL.Type.String{}
        true ->
          nil
      end
      field = %{
        type: graphql_type
        # TODO:
        # resolve: fn () -> end,
        # description: "",
        # args: %{}
      }
      {attr, field}
    end
    Enum.into fields, %{}
  end

  @doc """
  Runs a GraphQL query string against a given schema module
  """
  def run(query, schema) do
    GraphQL.execute schema, query
  end

  @doc """
  Converts a list of model modules into a single GraphQL schema module that
  can be run through `run`.
  """
  def schemaify(models) do
    pairs = for model <- models do
      %{query: query, mutation: mutation} = to_graphql_map(
        namespaces: Griffin.Model.Module.namespaces(model),
        fields: model.fields,
        create: resolver(model, :create),
        read: resolver(model, :read),
        update: resolver(model, :update),
        delete: resolver(model, :delete),
        list: resolver(model, :list)
      )
      {query, mutation}
    end
    base = %{query: %{fields: %{}}, mutation: %{fields: %{}}}
    %{query: q, mutation: m} = Enum.reduce pairs, base,
      fn ({query, mutation}, acc) ->
        %{
          query: %GraphQL.Type.ObjectType{
            name: "RootQueryType",
            fields: Map.merge(acc.query.fields, query)
          },
          mutation: %GraphQL.Type.ObjectType{
            name: "RootMutationType",
            fields: Map.merge(acc.mutation.fields, mutation)
          }
        }
      end
    %GraphQL.Schema{query: q, mutation: m}
  end

  defp resolver(model, crud_op) do
    fn (_, args, _) ->
      Griffin.Model.Module.resolve(model, crud_op, args).res
    end
  end
end