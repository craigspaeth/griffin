defmodule Griffin.ViewModel.ServerTest do
  @moduledoc false

  use ExUnit.Case

  test "sets updates to a model map" do
    model = %{name: "Harry Potter", school: "Hogwarts"}
    voldemort = Griffin.ViewModel.Server.set model, name: "Voldemort"
    assert voldemort.name == "Voldemort"
  end

  test "sets deep updates to a map" do
    model = %{
      name: "Harry Potter",
      school: %{
        name: "Hogwarts",
        location: "Wizard World"
      }
    }
    wizard = Griffin.ViewModel.Server.set model, school: %{name: "Griffindor"}
    assert wizard.school.name == "Griffindor"
    assert wizard.school.location == "Wizard World"
  end
end