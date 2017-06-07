defmodule GriffinModelTest do
  @moduledoc """
  Tests for the Griffin Model library
  """
  
  use ExUnit.Case

  test "converts a Griffin model spec into a GraphQL schema" do
    noop = fn () -> nil end
    %{query: q, mutation: m} = Griffin.Model.to_graphql_schemas(
      namespace: :wizard,
      fields: [
        name: [:string, :required],
        school: [:string]
      ],
      create: noop,
      read: fn (_, args, _) ->
        %{name: get_in(args, [:name]) || "Voldemort"}
      end,
      update: noop,
      delete: noop,
      list: noop
    )
    schema = %GraphQL.Schema{
      query: %GraphQL.Type.ObjectType{
        name: "RootQueryType",
        fields: q
      },
      mutation: %GraphQL.Type.ObjectType{
        name: "RootMutationType",
        fields: m
      }
    }
    res = GraphQL.execute schema, "{
      wizard(name: \"Harry Potter\") {
        name
      }
    }"
    assert res == {:ok, %{data: %{"wizard" => %{"name" => "Harry Potter"}}}}
  end
end