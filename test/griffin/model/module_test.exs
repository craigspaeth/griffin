defmodule Griffin.Model.ModuleTest do
  @moduledoc false

  use ExUnit.Case

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

  test "converts a bunch of models into a grapqhl schema" do
    schema = Griffin.Model.Module.graphqlify [WizardModel]
    {status, res} = GraphQL.execute schema, "mutation Wizard {
      create_wizard(name: \"Harry Potter\") { name }
    }
    "
    assert status == :ok
    assert res.data["create_wizard"]["name"] == "Harry Potter"
  end

  test "converts models into a list query" do
    schema = Griffin.Model.Module.graphqlify [WizardModel]
    Griffin.Model.Adapters.Memory.create :wizards, %{name: "Harry Potter"}
    {status, res} = GraphQL.execute schema, "query Wizard {
      wizards(name: \"Harry Potter\") { name }
    }
    "
    assert status == :ok
    assert List.first(res.data["wizards"])["name"] == "Harry Potter"
  end

  test "run a model's resolver" do
    ctx = Griffin.Model.Module.resolve WizardModel, :create, %{
      name: "Harry Potter",
      school: %{
        name: "Hogwarts",
        geo: %{
          lat: 10,
          lng: 20
        }
      }
    }
    assert ctx.res == %{
      id: 0,
      name: "Harry Potter",
      school: %{
        name: "Hogwarts",
        geo: %{
          lat: 10,
          lng: 20
        }
      }
    }
  end

  test "surfaces validation errors through a model's resolver" do
    ctx = Griffin.Model.Module.resolve WizardModel, :create, %{
      name: "Harry"
    }
    [{_, msg}] = ctx.errs
    assert String.match? msg, ~r/school with value nil is invalid/
  end
end