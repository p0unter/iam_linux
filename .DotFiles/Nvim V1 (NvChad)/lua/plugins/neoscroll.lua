return {
  "karb94/neoscroll.nvim",
  lazy = false,
  priority = 1000,
  opts = {
    easing_function = "quadratic",
    hide_cursor = true,
    cursor_scrolls_alone = true,
    performance_mode = true,
  },
  config = function(_, opts)
    require("neoscroll").setup(opts)
  end,
}

