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
    [applications: [:logger, :cowboy, :plug]]
  end

  def deps do
    [
      {:cowboy, "~> 1.0.0"},
      {:plug, "~> 1.0"},
      {:mix_test_watch, "~> 0.3", only: :dev, runtime: false}
    ]
  end
end
