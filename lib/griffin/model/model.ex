defmodule Griffin.Model do
  alias Griffin.Model.Validations
  alias Griffin.Model.DSL

  @moduledoc """
  Module for importing into model modules. Provides fuctions like `validate`
  that are helpful for common model functionality.
  """

  @doc """
  A model resolver that given a fields DSL will ensure it's valid or
  add validations to the errors
  """
  def validate(%{errs: errs} = ctx, _) when length(errs) > 0, do: ctx
  def validate(ctx, fields) do
    fields = DSL.for_crud_op fields, ctx.op
    is_valid = Validations.valid? ctx.args, fields
    if is_valid do
      ctx
    else
      %{ctx | errs: ctx.errs ++ Validations.errors(ctx.args, fields)}
    end 
  end
end