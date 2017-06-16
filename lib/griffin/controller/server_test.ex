defmodule Griffin.Controller.Server do
  @moduledoc """
  Module for accepting plug connections, talking to a UI Model, and returning
  HTML from a Griffin view.
  """

  @doc """
  Takes a Griffin view and renders it to HTML given a view model
  """
  def render(view, model) do
    IO.inspect view
    IO.inspect model
  end
end