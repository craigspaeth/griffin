defmodule App do
  @moduledoc false
  def start(_, _) do
    val = if true, do: "Hi", else: "Fail"
    JS.console.log val
  end
end

defmodule Mix.Tasks.Js do
  @moduledoc false

  use Mix.Task

  @shortdoc "Simply runs the Hello.say/0 command."
  def run(_) do
    IO.puts "Building bootstrap file..."
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
  end
end