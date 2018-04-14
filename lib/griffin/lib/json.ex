defmodule Griffin.JSON do
  @moduledoc """
  Elixir(script) wrapper for a universal JSON API
  """

  import ExScript.Universal

  def parse!(string) do
    if env?(:server) do
      Poison.Parser.parse!(string, keys: :atoms!)
    else
      JS.embed("JSON.parse(string)")
    end
  end

  def stringify!(map) do
    if env?(:server) do
      Poison.encode!(map)
    else
      JS.embed("JSON.stringify(map)")
    end
  end
end
