defmodule Griffin.Validations do
  @moduledoc """
  A library of built-in simple validation functions that return true/false
  """

  def required(val) do
    not is_nil val
  end

  def min(val, len) do
    String.length(val) >= len 
  end

  def max(val, len) do
    String.length(val) <= len     
  end

  def keys(val, schema) do
    Griffin.Model.valid? val, schema
  end
end
