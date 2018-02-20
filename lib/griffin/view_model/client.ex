defmodule Griffin.ViewModel.Client do
  @moduledoc """
  A single model that encapsulates the entire view state of an app. This
  client-side version provides a convenient `set` function which
  is used to update a singel state map that triggers a re-render in React.
  """

  @doc """
  A convenience function that takes a model map and a keyword list of updated
  attributes as input, returning a deep merged update of the map as output, and
  triggering a re-render of the view.
  """
  def set(model, attrs) do
    deep_merge(model, attrs)
  end

  @doc """
  Utility to help with sending a graphql request
  """
  def gql!(endpoint, query, callback) do
    res = JS.embed "fetch(endpoint, { body: query, headers: { 'content-type': 'application/graphql' }, method: 'POST' })"
    res.then fn (r) ->
      j = r.json(nil)
      j.then fn (r) ->
        callback.(r.data)
      end
    end
  end

  # Deep merge map utility copied from
  # https://stackoverflow.com/questions/38864001/elixir-how-to-deep-merge-maps
  defp deep_merge(left, right) do
    Map.merge(left, right, &deep_resolve/3)
  end

  defp deep_resolve(_key, left, right) do
    deep_merge(left || %{}, right || %{})
  end

  defp deep_resolve(_key, _left, right) do
    right
  end
end
