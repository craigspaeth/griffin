defmodule Griffin.Validations do
  @moduledoc """
  A library of built-in simple validation functions that return true/false
  """

  def required(val) do
    not is_nil val
  end

  def min(val, m) do
    String.length val < m 
  end
end
