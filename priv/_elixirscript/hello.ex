
defmodule App do
  @moduledoc false

  def start(_, _) do
    val = "foobar"
    ret = cond do
      :foo == :foo -> "bar"
    end
    :console.log(ret)
  end
end