defmodule Griffin.Validations do
  @moduledoc """
  A library of built-in simple validation functions that return true/false
  """

  def equals(_, val, ref) do
    val == ref
  end

  def required(_, val) do
    not is_nil val
  end

  def must(type, val, sig) do
    [func, arg] = sig
    func.(type, val, arg)
  end

  def min(type, val, len) when type == :string do
    String.length(val) >= len
  end

  def min(type, val, len) when type == :int do
    val >= len
  end

  def max(type, val, len) when type == :string do
    String.length(val) <= len
  end

  def max(type, val, len) when type == :int do
    val <= len     
  end

  def max(type, val, len) when type == :list do
    Enum.count(val) <= len     
  end

  def of(type, val, schema) when type == :map do
    Griffin.Model.valid? val, schema
  end

  def of(type, val, schema) when type == :list do
    valids = for item <- val do
      Griffin.Model.valid? %{item: item}, [item: schema]
    end
    valids |> List.flatten |> Enum.all? 
  end

  def of(type, val, schemas) when type == :either do
    valids = for schema <- schemas do
      Griffin.Model.valid? %{item: val}, [item: schema]
    end
    valids |> List.flatten |> Enum.any?
  end
end
