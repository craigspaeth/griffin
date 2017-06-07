defmodule Griffin.Model.ValidationsTest do
  @moduledoc """
  Tests for Griffin validations functionality
  """
  
  use ExUnit.Case
  import Griffin.Model.Validations
  
  test "validates a DSL schema" do
    schema = [
      name: [:string, :required]
    ]
    harry = %{name: "Harry Potter"}
    voldemort = %{name: nil}
    assert valid? harry, schema
    assert not valid? voldemort, schema
  end
  
  test "validates a DSL schema using imported functions" do
    schema = [
      name: [:string, &required/2]
    ]
    harry = %{name: "Harry Potter"}
    voldemort = %{name: nil}
    assert valid? harry, schema
    assert not valid? voldemort, schema
  end

  test "validates key val pairs" do
    schema = [
      name: [:string, min: 10]
    ]
    bob = %{name: "Bob"}
    assert not valid? bob, schema
  end

  test "validates multiple key val pairs" do
    schema = [
      name: [:string, min: 4, max: 6]
    ]
    assert not valid? %{name: "Bob"}, schema
    assert not valid? %{name: "Miranda"}, schema
    assert valid? %{name: "Sarah"}, schema
  end
  
  test "validates custom validation functions" do
    starts_with_letter = fn (_, val, letter) ->
      String.first(val) == letter
    end
    schema = [
      name: [:string, [starts_with_letter, "A"]]
    ]
    assert not valid? %{name: "Bob"}, schema
    assert valid? %{name: "Anne"}, schema
  end

  test "validates custom validation functions without args" do
    starts_with_letter_a = fn (_, val) ->
      String.first(val) == "A"
    end
    schema = [
      name: [:string, starts_with_letter_a]
    ]
    assert not valid? %{name: "Bob"}, schema
    assert valid? %{name: "Anne"}, schema
  end

  test "validates custom validation functions based on types" do
    starts_with_letter_a = fn (type, val) when type == :string ->
      String.first(val) == "A"
    end
    schema = [name: [:string, starts_with_letter_a]]
    assert not valid? %{name: "Bob"}, schema
    assert valid? %{name: "Anne"}, schema
    schema = [name: [:int, starts_with_letter_a]]
    assert not valid? %{name: "A Num"}, schema
  end

  test "validates nested maps" do
    schema = [
      location: [:map, of: [
        city: [:string, :required, min: 3]
      ]]
    ]
    cincinnati = %{
      location: %{
        city: "Cincinnati"
      }
    }
    new_york = %{
      location: %{
        city: "NY"
      }
    }
    assert valid? cincinnati, schema
    assert not valid? new_york, schema
  end

  test "validates lists" do
    schema = [
      children: [:list, of: [:string, :required, min: 4]]
    ]
    parent = %{children: ["Bobby"]}
    expecting_parent = %{children: ["N/A"]}
    assert valid? parent, schema
    assert not valid? expecting_parent, schema
  end

  test "validates either types" do
    schema = [
      id: [:either, of: [
        [:string, min: 10],
        [:int, max: 100]
      ]]
    ]
    assert valid? %{id: "abcdefghijkl"}, schema
    assert valid? %{id: 99}, schema
    assert not valid? %{id: 101}, schema
  end

  test "validates list either types" do
    schema = [
      children: [:list, max: 3, of: [:either, of: [
        [:string, equals: "Bobby"],
        [:string, equals: "Sally"]
      ]]]
    ]
    assert valid? %{children: ["Bobby", "Sally"]}, schema
    assert not valid? %{children: ["Bobby", "Sally", "Timmy"]}, schema
    assert valid? %{children: ["Bobby", "Sally", "Bobby"]}, schema
    assert not valid? %{children: ["Bobby", "Sally", "Bobby", "Sally"]}, schema
  end

  test "validates rules that only apply to CRUD operations" do
    schema = [
      name: [:string,
        max: 5,
        on_create_read: [:required],
        on_create: [min: 10]
      ]
    ]
    assert not valid? %{name: "Bob"}, schema, :create
    assert valid? %{name: "Bob"}, schema, :read
  end

  test "validates emails" do
    schema = [email: [:string, :email]]
    assert valid? %{email: "foo@bar.com"}, schema
    assert not valid? %{email: "foo@bar"}, schema
  end
end
