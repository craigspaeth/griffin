defmodule Griffin.Model.ModuleTest do
  @moduledoc false
  
  use ExUnit.Case

  defmodule WizardModel do
    @moduledoc """
    A test wizard model
    """
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
      IO.inspect ctx
    end
  end

  test "converts a bunch of models into a grapqhl schema" do
    schema = Griffin.Model.Module.graphqlize [WizardModel]
    {status, r} = GraphQL.execute schema, "{
      wizard(name: \"Harry Potter\") {
        name
        school { name }
      }
    }"
    assert status == :ok
  end

  test "run a model's resolver" do
    Giffin.Model.Module.resolve WizardModel
  end
end