defmodule Griffin.HTTP do
  @moduledoc """
  Elixir(script) wrapper for a universal HTTP API
  """

  import ExScript.Universal

  def gql!(url, query) do
    res = await(post!(url, body: query, headers: ["Content-Type": "application/graphql"]))
    res.data
  end

  def post!(url, options) do
    json =
      if env?(:server) do
        res =
          HTTPotion.post(
            url,
            body: options[:body],
            headers: options[:headers]
          )

        Griffin.JSON.parse!(res.body)
      else
        opts = to_map(options)
        headers = to_map(opts["headers"])
        res = JS.embed("fetch(url, { body: opts.body, headers: headers, method: 'POST' })")
        res.then(fn r -> r.json(nil) end)
      end

    await(json)
  end

  defp to_map(keywords) do
    Enum.reduce(keywords, %{}, fn {k, v}, acc ->
      k = Atom.to_string(k)
      Map.merge(acc, %{k => v})
    end)
  end
end
