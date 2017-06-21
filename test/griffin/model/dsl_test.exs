defmodule Griffin.Model.DSLTest do
  @moduledoc false

  use ExUnit.Case

  def noop, do: nil

  test "converts a Griffin model spec into a GraphQL schema" do
    %{query: q, mutation: m} = Griffin.Model.DSL.to_graphql_map(
      namespaces: {:wizard, :wizards},
      fields: [
        name: [:string, :required],
        school: [:string]
      ],
      create: &noop/0,
      read: fn (_, args, _) ->
        %{name: get_in(args, [:name]) || "Voldemort"}
      end,
      update: &noop/0,
      delete: &noop/0,
      list: &noop/0
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

  test "works with conditional CRUD validations" do
    %{query: q, mutation: m} = Griffin.Model.DSL.to_graphql_map(
      namespaces: {:wizard, :wizards},
      fields: [name: [:string, on_list: :required]],
      create: &noop/0,
      read: &noop/0,
      update: &noop/0,
      delete: &noop/0,
      list: &noop/0
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
    {status, _} = GraphQL.execute schema, "{ wizard { name } }"
    assert status == :ok
    {status, _} = GraphQL.execute schema, "{ wizards { name } }"
    assert status == :error
  end


  test "pluralizes when provided only the singular" do
    %{query: q, mutation: m} = Griffin.Model.DSL.to_graphql_map(
      namespaces: {:wizard, :wizards},
      fields: [name: [:string, on_list: :required]],
      create: &noop/0,
      read: &noop/0,
      update: &noop/0,
      delete: &noop/0,
      list: &noop/0
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
    {status, _} = GraphQL.execute schema, "{ wizards { name } }"
    assert status == :error
  end
end