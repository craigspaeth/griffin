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
      elixir: "~> 1.4",
      build_embedded: Mix.env == :prod,
      start_permanent: Mix.env == :prod,
      deps: deps(),
      description: description(),
      package: package()
    ]
  end

  def application do
    [
      mod: {MyApp, []},
      applications: [:logger, :cowboy, :plug, :graphql, :httpotion]
    ]
  end

  def deps do
    [
      {:cowboy, "~> 1.0.0"},
      {:plug, "~> 1.0"},
      {:credo, "~> 0.8.0-rc6", only: [:dev, :test], runtime: false},
      {:mix_test_watch, "~> 0.3", only: :dev, runtime: false},
      {:graphql, "~> 0.3"},
      {:plug_graphql, "~> 0.3.1"},
      {:inflex, "~> 1.8.1" },
      {:httpotion, "~> 3.0.2"},
      {:poison, "~> 2.2"}
    ]
  end
end
