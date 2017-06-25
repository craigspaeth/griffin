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

  test "automatically pluralizes a namespace" do
    defmodule FooModel do
      @moduledoc false
      def namespace, do: :dog
    end
    {_, plural} = Griffin.Model.Module.namespaces FooModel
    assert plural == "dogs"
  end
end