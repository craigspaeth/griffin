# defmodule View do
#   def render(view, model) do
#     JS.console.log view
#     to_html view, model, view.render model
#   end

#   defp to_html(view, model, el) do
#     "Hello"
#     # cond do
#     #   is_bitstring el ->
#     #     el
#     #   is_list List.first(el) ->
#     #     el
#     #     |> Enum.map(fn (child) -> to_html view, model, child end)
#     #     |> Enum.join("")
#     #   is_list el ->
#     #     [tag_label | children] = el
#     #     has_els_func = not is_nil view.__info__(:functions)[:els]
#     #     if has_els_func and not is_nil view.els[tag_label] do
#     #       to_html view, model, view.els[tag_label].render model
#     #     else
#     #       {open, close} = split_tag_label view, tag_label
#     #       children = children
#     #       |> Enum.map(fn (child) -> to_html view, model, child end)
#     #       |> Enum.join("")
#     #       "#{open}#{children}#{close}"
#     #     end
#     # end
#   end

#   # defp split_tag_label(view, tag) do
#   #   [tag_name | refs] = tag |> to_string |> String.split("@")
#   #   inline_styles = if length(refs) > 0 do
#   #     styles = refs
#   #     |> Enum.map(&view.styles[String.to_atom &1])
#   #     |> Enum.reduce(fn (style_map, acc) -> Map.merge acc, style_map end)
#   #     |> Map.to_list
#   #     |> Enum.map(fn ({k, v}) ->
#   #         k = String.replace to_string(k), "_", "-"
#   #         "#{k}: #{v}"
#   #       end)
#   #     |> Enum.join("; ")
#   #     " style=\"#{styles}\""
#   #   else
#   #     ""
#   #   end
#   #   {"<#{tag_name}#{inline_styles}>", "</#{tag_name}>"}
#   # end
# end

defmodule MyModule do
  def render(_) do
    [1, 2, 3]
  end
end

defmodule App do
  @moduledoc false
  def start(_, _) do
    html = MyView.render %{}
    JS.console.log html
  end
end

defmodule Mix.Tasks.Js do
  @moduledoc false

  use Mix.Task

  @shortdoc "Simply runs the Hello.say/0 command."
  def run(_) do
    IO.puts "Building bootstrap file..."
    System.cmd "yarn", ["install"], cd: "./deps/elixir_script"
    System.cmd "yarn", ["build"], cd: "./deps/elixir_script"
    IO.puts "Copying bootstrap file..."
    bootstrap_file = "./deps/elixir_script/priv/build/iife/Elixir.Bootstrap.js"
    bootstrap_js = File.read! bootstrap_file
    bootstrap_dir = "./_build/dev/lib/elixir_script/priv/build/iife"
    File.mkdir_p! bootstrap_dir
    File.write! "#{bootstrap_dir}/Elixir.Bootstrap.js", bootstrap_js
    IO.puts "Compiling JS..."
    js = ElixirScript.Compiler.compile App, [format: :umd]
    File.write! "./priv/js/app.js", js
    System.cmd "prettier-standard-formatter", ["priv/js/app.js"]
    IO.puts "All done!"
  end
end