defmodule Griffin.Model do
  @moduledoc """
  Model library providing validation, database persistence, and
  GraphQL integration.
  """

  @doc """
  Converts a Griffin fields DSL into a set of GraphQL Elixir schemas that can
  be run through `GraphQL.execute`.

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

    iex> schema = Griffin.Model.fields_to_graphql [name: [:string]] 
    iex> GraphQL.execute schema, "{ name }"
    {:ok, %{data: %{"name" => "Harry Potter"}}}
  
  """
  def to_graphql_schemas(
    namespace: namespace,
    fields: fields,
    create: create,
    read: read,
    update: update,
    delete: delete,
    list: list
  ) do
    # Read Query
    read_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "#{String.capitalize to_string namespace}QueryType",
        fields: dsl_to_graphql(fields, :read)
      },
      resolve: read,
      args: dsl_to_graphql(fields, :read)
    }
    # List Query
    list_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "#{String.capitalize to_string namespace}ListQueryType",
        fields: dsl_to_graphql(fields, :list)
      },
      resolve: list,
      args: dsl_to_graphql(fields, :list)
    }
    # Create Mutation
    create_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "Create#{String.capitalize to_string namespace}MutationType",
        fields: dsl_to_graphql(fields, :create)
      },
      resolve: create,
      args: dsl_to_graphql(fields, :create)
    }
    # Delete Mutation
    delete_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "Delete#{String.capitalize to_string namespace}MutationType",
        fields: dsl_to_graphql(fields, :delete)
      },
      resolve: delete,
      args: dsl_to_graphql(fields, :delete)
    }
    # Update Mutation
    update_field = %{
      type: %GraphQL.Type.ObjectType{
        name: "Update#{String.capitalize to_string namespace}MutationType",
        fields: dsl_to_graphql(fields, :update)
      },
      resolve: update,
      args: dsl_to_graphql(fields, :update)
    }
    # Compose CRUDL schemas into a map of query/mutation GraphQL schemas
    %{
      query: %{
        String.to_atom "#{namespace}" => read_field,
        String.to_atom "#{namespace}_list" => list_field
      },
      mutation: %{
        String.to_atom "create_#{namespace}" => create_field,
        String.to_atom "update_#{namespace}" => update_field,
        String.to_atom "delete_#{namespace}" => delete_field
      }
    }
  end

  defp dsl_to_graphql(fields, crud_operation) do
    fields = for {attr, [type | rules]} <- fields do
      graphql_type = case type do
        :string -> %GraphQL.Type.String{}
        true -> nil
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
end
