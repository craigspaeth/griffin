defmodule Griffin.Model.Module do
  @moduledoc """
  Module for interacting with Griffin models. Griffin models are elixir
  modules that expect certain functions to be defined for the sake of data
  validation, database persistence, and GraphQL integration.
  """

  @doc """
  Converts a list of model modules into a single GraphQL schema that
  can be run through `GraphQL.execute`.
  """
  def graphqlize(models) do
    pairs = for model <- models do
      noop = fn (_, _, _) -> nil end
      %{query: query, mutation: mutation} = Griffin.Model.DSL.to_graphql_map(
        namespace: model.namespace,
        fields: model.fields,
        create: noop,
        read: noop,
        update: noop,
        delete: noop,
        list: noop
      )
      {query, mutation}
    end
    base = %{query: %{fields: %{}}, mutation: %{fields: %{}}}
    Enum.reduce pairs, base, fn ({query, mutation}, acc) ->
      %{
        query: %GraphQL.Type.ObjectType{
          name: "RootQueryType",
          fields: Map.merge(acc.query.fields, query)
        },
        mutation: %GraphQL.Type.ObjectType{
          name: "RootMutationType",
          fields: Map.merge(acc.mutation, mutation)
        }
      }
    end
  end
end
