defmodule MyApp.View do
  def styles do
    [
      ul: [
        list_style: "none"
      ],
      item: [
        font_size: "16px",
        font_family: "Helvetica"
      ],
      header: [
        font_size: "16px",
        font_weight: "bold",
        font_family: "Helvetica"
      ]
    ]
  end

  def render(model) do
    [:div,
      [
        :ul,
        if length(model.wizards) > 0 do
          for wizard <- model.wizards do
            [:li@item, "Welcome #{wizard.name}"]
          end
        else
          [:h1@header, "No wizards"]
        end
      ],
      [:button, "Add wizard"]
    ]
  end
end
