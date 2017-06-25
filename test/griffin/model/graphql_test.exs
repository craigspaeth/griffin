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

  test "converts models into a create mutation" do
    schema = Griffin.Model.GraphQL.schemaify [WizardModel]
    {status, res} = "mutation {
      create_wizard(name: \"Harry Potter\") { name }
    }
    " |> Griffin.Model.GraphQL.run(schema)
    assert status == :ok
    assert res.data["create_wizard"]["name"] == "Harry Potter"
  end

  test "converts models into a read query" do
    Griffin.Model.Adapters.Memory.create :wizards, %{name: "Harry Potter"}
    schema = Griffin.Model.GraphQL.schemaify [WizardModel]
    {status, res} = "{ wizard { name } }" |> Griffin.Model.GraphQL.run(schema)
    assert status == :ok
    assert res.data["wizard"]["name"] == "Harry Potter"
  end

  test "converts models into a read query with args" do
    Griffin.Model.Adapters.Memory.create :wizards, %{name: "Harry Potter"}
    schema = Griffin.Model.GraphQL.schemaify [WizardModel]
    {status, res} = "{
      wizard(name: \"Harry Potter\")  { name }
    }" |> Griffin.Model.GraphQL.run(schema)
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