defmodule Griffin.Model do
  @moduledoc """
  Model library providing validation, database persistence, and
  GraphQL integration.
  """

  @doc """
  Converts a list of model modules into a single GraphQL schema that
  can be run through `GraphQL.execute`.
  """
  def graphqlize(models) do
    noop = fn (_, _, _) -> nil end
    for model <- models do
      schema_map = Griffin.Model.DSL.to_graphql_map(
        namespace: model.namespace,
        fields: model.fields,
        create: noop,
        read: noop,
        update: noop,
        delete: noop,
        list: noop
      )
      IO.inspect schema_map
    end
    models
  end
end
