defmodule GriffinModelTest do
  use ExUnit.Case
  import Griffin.Validations
  import Griffin.Model

  test "validates a map of fields" do
    schema = [
      name: [:string, required()]
    ]
    harry = %{name: "Harry Potter"}
    voldemort = %{name: nil}
    assert valid? harry, schema
    assert not valid? voldemort, schema
  end

  test "validates a complex schema" do
    # [
    #   name: [:string, length: 0..10],
    #   age: [:int, between: 0..100],
    #   single: [:boolean, :required],
    #   children: [:list, :required, max_items: 10, items: [
    #     [:string, length: 0..100],
    #     [:number, max: 100, &custom_fn/1]
    #   ]],
    #   location: [:object, :required, keys: [
    #     city: [:string, :required],
    #     geo: [:object, keys: [
    #       lat: [:float, :required],
    #       lng: [:float, :required]
    #     ]]
    #   ]]
    # ]
  end
end
