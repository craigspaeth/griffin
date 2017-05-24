defmodule Griffin.Validations do
  @moduledoc """
  A library of built-in simple validation functions that return true/false
  """

  def required() do
    fn (val) -> not is_nil val end
  end
end
