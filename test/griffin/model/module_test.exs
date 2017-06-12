defmodule Griffin.Model.ModuleTest do
  @moduledoc false
  
  use ExUnit.Case

  defmodule WizardModel do
    @moduledoc """
    A test wizard model
    """
    import Griffin.Model
    import Griffin.Model.Adapters.Memory

    def namespace, do: :wizard

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
    schema = Griffin.Model.Module.graphqlize [WizardModel]
    {status, res} = GraphQL.execute schema, "{
      wizard(name: \"Harry Potter\") {
        name
        school { name }
      }
    }"
    IO.inspect res
    assert status == :ok
  end

  test "run a model's resolver" do
    Griffin.Model.Adapters.Memory.init
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
    Griffin.Model.Adapters.Memory.init
    ctx = Griffin.Model.Module.resolve WizardModel, :create, %{
      name: "Harry"
    }
    [{_, msg}] = ctx.errs
    assert String.match? msg, ~r/school with value nil is invalid/
  end
end