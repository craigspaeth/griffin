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
  def to_graphql_schema(
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
        name: "#{namespace}QueryType",
        fields: dsl_to_graphql_fields(fields, :read)
      }
    }
    # List Query
    # Create Mutation
    # Delete Mutation
    # Update Mutation
    %GraphQL.Schema{
      query: %GraphQL.Type.ObjectType{
        name: "RootQueryType",
        fields: %{
          namespace => read_field
        }
      }
    }
  end

  @doc """
  Converts a fields DSL into a GraphQL fields map
  """
  defp dsl_to_graphql_fields(fields, crud_operation) do
    fields = for {attr, [type | rules]} <- fields do
      graphql_type = case type do
        :string -> %GraphQL.Type.String{}
        true -> nil
      end
      {attr, graphql_type}
    end
    IO.inspect fields
    fields
  end
end
