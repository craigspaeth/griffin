defmodule Griffin.ViewModel.Server do
  @moduledoc """
  A single model that encapsulates the entire view state of an app. This
  server-side version simply provides a convenient `set` function which
  is used to update a map. View models are expected to return the model state
  in each of their functions so that route controllers on the server-side can
  maintain immutability and pass a simple map to a `render` function.
  """

  @doc """
  A convenience function that takes a model map and a keyword list of updates
  attributes as input, returning a deep merged update of the map as output.
  """
  def set(model, attrs) do
    deep_merge(model, Enum.into(attrs, %{}))
  end

  @doc """
  Utility to help with sending a graphql request
  """
  def gql!(endpoint, query) do
    response =
      HTTPotion.post!(
        endpoint,
        body: query,
        headers: ["Content-Type": "application/graphql"]
      )

    Task.async(fn -> Poison.decode!(response.body, keys: :atoms!).data end)
  end

  # Deep merge map utility copied from
  # https://stackoverflow.com/questions/38864001/elixir-how-to-deep-merge-maps
  defp deep_merge(left, right) do
    Map.merge(left, right, &deep_resolve/3)
  end

  defp deep_resolve(_key, left = %{}, right = %{}) do
    deep_merge(left, right)
  end

  defp deep_resolve(_key, _left, right) do
    right
  end
end
