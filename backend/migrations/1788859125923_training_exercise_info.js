exports.up = (pgm) => {
  pgm.addColumns("exercises", {
    description: {
      type: "text",
      notNull: false,
    },
    primary_muscles: {
      type: "text",
      notNull: false,
    },
    secondary_muscles: {
      type: "text",
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns("exercises", [
    "description",
    "primary_muscles",
    "secondary_muscles",
  ]);
};
