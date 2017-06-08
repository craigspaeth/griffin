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
  end

  test "converts a bunch of models into a grapqhl schema" do
    schema = Griffin.Model.Module.graphqlize [WizardModel]
    {status, r} = GraphQL.execute schema, "{
      wizard(name: \"Harry Potter\") {
        name
        school { name }
      }
    }"
    IO.inspect r
    assert status == :ok
  end
end