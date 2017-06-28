defmodule Griffin.Mixfile do
  use Mix.Project

  def description do
    """
    A WIP Elixir(script) framework
    """
  end

  def package do
    [
      name: :griffin,
      files: ["lib", "mix.exs", "README*", "LICENSE*"],
      maintainers: ["Craig Spaeth"],
      licenses: ["MIT"],
      links: %{"GitHub" => "https://github.com/craigspaeth/griffin"}
    ]
  end

  def project do
    [
      app: :griffin,
      version: "0.1.0",
      elixir: "~> 1.5",
      build_embedded: Mix.env == :prod,
      start_permanent: Mix.env == :prod,
      deps: deps(),
      description: description(),
      package: package(),
      elixir_script: [
        input: ESApp,
        output: "priv/elixirscript/app.js",
        format: :umd,
        js_modules: [
          {React, "react"},
          {ReactDOM, "react-dom"}
        ]
      ],
      compilers: Mix.compilers ++ [:elixir_script]
    ]
  end

  def application do
    [
      mod: {MyApp, []},
      applications: [:absinthe_plug, :logger, :cowboy, :plug, :httpotion]
    ]
  end

  def deps do
    [
      {:absinthe, "~> 1.3.1"},
      {:absinthe_plug, "~> 1.3.1"},
      {:cowboy, "~> 1.0.0"},
      {:credo, "~> 0.8.0-rc6", only: [:dev, :test], runtime: false},
      {:elixir_script, git: "git@github.com:elixirscript/elixirscript.git"},
      {:fs, "~> 3.4", override: true},
      {:httpotion, "~> 3.0.2"},
      {:inflex, "~> 1.8.1" },
      {:mix_test_watch, "~> 0.3", only: :dev, runtime: false},
      {:plug, "~> 1.0"},
      {:poison, "~> 2.2"},
      {:uuid, "~> 1.1"}
    ]
  end
end
