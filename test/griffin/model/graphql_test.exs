defmodule Griffin.Model.GraphQLTest do
  @moduledoc false

  use ExUnit.Case

  def noop, do: nil

  setup do
    Griffin.Model.Adapters.Memory.empty
    Griffin.Model.Adapters.Memory.init
    :ok
  end

  defmodule WizardModel do
    @moduledoc """
    A test wizard model
    """
    import Griffin.Model
    import Griffin.Model.Adapters.Memory

    def namespace, do: {:wizard, :wizards}

    def fields, do: [
      name: [:string, :required],
      school: [:map, of: [
        name: [:string],
        geo: [:map, of: [
          lat: [:int, :required],
          lng: [:int, :required]
        ]]
      ]]
    ]

    def resolve(ctx) do
      ctx
      |> validate(fields())
      |> to_db_statement
    end
  end

  # test "converts a Griffin model spec into a GraphQL schema" do
  #   %{query: q, mutation: m} = Griffin.Model.GraphQL.to_graphql_map(
  #     namespaces: {:wizard, :wizards},
  #     fields: [
  #       name: [:string, :required],
  #       school: [:string]
  #     ],
  #     create: &noop/0,
  #     read: fn (_, args, _) ->
  #       %{name: get_in(args, [:name]) || "Voldemort"}
  #     end,
  #     update: &noop/0,
  #     delete: &noop/0,
  #     list: &noop/0
  #   )
  #   schema = %GraphQL.Schema{
  #     query: %GraphQL.Type.ObjectType{
  #       name: "RootQueryType",
  #       fields: q
  #     },
  #     mutation: %GraphQL.Type.ObjectType{
  #       name: "RootMutationType",
  #       fields: m
  #     }
  #   }
  #   res = GraphQL.execute schema, "{
  #     wizard(name: \"Harry Potter\") {
  #       name
  #     }
  #   }"
  #   assert res == {:ok, %{data: %{"wizard" => %{"name" => "Harry Potter"}}}}
  # end

  # test "works with conditional CRUD validations" do
  #   %{query: q, mutation: m} = Griffin.Model.GraphQL.to_graphql_map(
  #     namespaces: {:wizard, :wizards},
  #     fields: [name: [:string, on_list: :required]],
  #     create: &noop/0,
  #     read: &noop/0,
  #     update: &noop/0,
  #     delete: &noop/0,
  #     list: &noop/0
  #   )
  #   schema = %GraphQL.Schema{
  #     query: %GraphQL.Type.ObjectType{
  #       name: "RootQueryType",
  #       fields: q
  #     },
  #     mutation: %GraphQL.Type.ObjectType{
  #       name: "RootMutationType",
  #       fields: m
  #     }
  #   }
  #   {status, _} = GraphQL.execute schema, "{ wizard { name } }"
  #   assert status == :ok
  #   {status, _} = GraphQL.execute schema, "{ wizards { name } }"
  #   assert status == :error
  # end


  # test "pluralizes when provided only the singular" do
  #   %{query: q, mutation: m} = Griffin.Model.GraphQL.to_graphql_map(
  #     namespaces: {:wizard, :wizards},
  #     fields: [name: [:string, on_list: :required]],
  #     create: &noop/0,
  #     read: &noop/0,
  #     update: &noop/0,
  #     delete: &noop/0,
  #     list: &noop/0
  #   )
  #   schema = %GraphQL.Schema{
  #     query: %GraphQL.Type.ObjectType{
  #       name: "RootQueryType",
  #       fields: q
  #     },
  #     mutation: %GraphQL.Type.ObjectType{
  #       name: "RootMutationType",
  #       fields: m
  #     }
  #   }
  #   {status, _} = GraphQL.execute schema, "{ wizards { name } }"
  #   assert status == :error
  # end

  # test "converts a bunch of models into a grapqhl schema" do
  #   schema = Griffin.Model.GraphQL.graphqlify [WizardModel]
  #   {status, res} = GraphQL.execute schema, "mutation Wizard {
  #     create_wizard(name: \"Harry Potter\") { name }
  #   }
  #   "
  #   assert status == :ok
  #   assert res.data["create_wizard"]["name"] == "Harry Potter"
  # end

  test "converts models into a read query" do
    Griffin.Model.Adapters.Memory.create :wizards, %{name: "Harry Potter"}
    schema = Griffin.Model.GraphQL.schemaify [WizardModel]
    {status, res} = "{ wizard { name } }" |> Griffin.Model.GraphQL.run(schema)
    assert status == :ok
    assert res.data["wizard"]["name"] == "Harry Potter"
  end

  test "converts models into a list query" do
    Griffin.Model.Adapters.Memory.create :wizards, %{name: "Harry Potter"}
    schema = Griffin.Model.GraphQL.schemaify [WizardModel]
    {status, res} = "{ wizards { name } }" |> Griffin.Model.GraphQL.run(schema)
    assert status == :ok
    assert List.first(res.data["wizards"])["name"] == "Harry Potter"
  end
end