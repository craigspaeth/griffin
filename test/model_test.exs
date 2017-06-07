defmodule GriffinModelTest do
  @moduledoc """
  Tests for the Griffin Model library
  """
  
  use ExUnit.Case
  import Griffin.Model

  test "converts a fields DSL into a GraphQL schema" do
    noop = fn () -> nil end
    schema = Griffin.Model.to_graphql_schema(
      namespace: :wizard,
      fields: [
        name: [:string, :required],
        school: [:string]
      ],
      create: noop,
      read: fn (_, args, ast) ->
        %{name: get_in(args, [:name]) || "Voldemort"}
      end,
      update: noop,
      delete: noop,
      list: noop
    )
    res = GraphQL.execute schema, "{
      wizard(name: \"Harry Potter\") {
        name
      }
    }"
    assert res == {:ok, %{data: %{"wizard" => %{"name" => "Harry Potter"}}}}
  end
end