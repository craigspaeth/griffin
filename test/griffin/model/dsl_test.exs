defmodule Griffin.Model.DSLTest do
  @moduledoc false
  
  use ExUnit.Case

  def noop, do: nil

  test "converts a Griffin model spec into a GraphQL schema" do
    %{query: q, mutation: m} = Griffin.Model.DSL.to_graphql_map(
      namespace: :wizard,
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
      namespace: :wizard,
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
    res = GraphQL.execute schema, "{ wizard { name } }"
    IO.inspect res
    res = GraphQL.execute schema, "{ wizard_list { name } }"
    IO.inspect res
  end
  
  # defmodule WizardModel do
  #   @moduledoc """
  #   A test wizard model
  #   """
  #   def namespace, do: :wizard

  #   def fields, do: [
  #     name: [:string, :required],
  #     school: [:map, of: [
  #       name: [:string],
  #       geo: [:map, of: [
  #         lat: [:int, :required],
  #         lng: [:int, :required]
  #       ]]
  #     ]] 
  #   ]
  # end

  # test "converts a bunch of models into a grapqhl schema" do
  #   IO.inspect Griffin.Model.DSL.graphqlize [WizardModel]
  # end
end