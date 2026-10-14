exports.up = (pgm) => {
  pgm.sql(`
    UPDATE exercises
    SET category = CASE category
      WHEN 'chest' THEN 'Грудь'
      WHEN 'back' THEN 'Спина'
      WHEN 'legs_glutes' THEN 'Ноги / Ягодицы'
      WHEN 'shoulders' THEN 'Дельты'
      WHEN 'arms' THEN 'Руки'
      WHEN 'abs' THEN 'Пресс'
      WHEN 'cardio' THEN 'Кардио'
      WHEN 'yoga' THEN 'Йога'
      ELSE category
    END
    WHERE user_id IS NULL
      AND category IN (
        'chest', 'back', 'legs_glutes', 'shoulders',
        'arms', 'abs', 'cardio', 'yoga'
      );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE exercises
    SET category = CASE category
      WHEN 'Грудь' THEN 'chest'
      WHEN 'Спина' THEN 'back'
      WHEN 'Ноги / Ягодицы' THEN 'legs_glutes'
      WHEN 'Дельты' THEN 'shoulders'
      WHEN 'Руки' THEN 'arms'
      WHEN 'Пресс' THEN 'abs'
      WHEN 'Кардио' THEN 'cardio'
      WHEN 'Йога' THEN 'yoga'
      ELSE category
    END
    WHERE user_id IS NULL
      AND category IN (
        'Грудь', 'Спина', 'Ноги / Ягодицы', 'Дельты',
        'Руки', 'Пресс', 'Кардио', 'Йога'
      );
  `);
};
