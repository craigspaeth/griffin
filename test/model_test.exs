defmodule UserModel do
  @moduledoc """
  Test user model
  """
  import Griffin.Model

  @fields [
    username: [:string],
    email: [:string, :email],
    birth_year: [:int, min: 1900, max: 2017]
  ]
end

defmodule GriffinModelTest do
  @moduledoc """
  Tests for the Griffin Model library
  """
  
  use ExUnit.Case
  import Griffin.Model

  def noop do nil end

  test "converts a fields DSL into a GraphQL schema" do
    schema = Griffin.Model.to_graphql_schema(
      namespace: :wizard,
      fields: [name: [:string]],
      create: fn (ctx, args, ast) ->
        args.name || "Voldemort"
      end,
      read: noop,
      update: noop,
      delete: noop,
      list: noop
    )
    res = GraphQL.execute schema, "{
      wizard(name: \"Harry Potter\")
    }"
    assert res == {:ok, %{data: %{"name" => "Harry Potter"}}}
  end
end