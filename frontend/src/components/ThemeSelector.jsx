const themeOptions = [
  { value: 'solid', label: 'Cor sólida', helper: 'Ex.: #0ea5e9' },
  { value: 'gradient', label: 'Gradiente', helper: 'Ex.: 135deg, #0ea5e9, #8b5cf6' },
  { value: 'image', label: 'Imagem', helper: 'URL completa da imagem' },
];

const ThemeSelector = ({ value, onChange }) => {
  const handleTypeChange = (event) => {
    onChange({ ...value, themeType: event.target.value });
  };

  const handleValueChange = (event) => {
    onChange({ ...value, themeValue: event.target.value });
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800">Tema do organograma</h3>
      <p className="mt-1 text-sm text-slate-500">Personalize o plano de fundo que será exibido na página pública.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {themeOptions.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition ${
              value.themeType === option.value
                ? 'border-primary bg-primary/10 shadow-soft'
                : 'border-slate-200 hover:border-primary/60'
            }`}
          >
            <span className="text-sm font-medium text-slate-800">{option.label}</span>
            <span className="text-xs text-slate-500">{option.helper}</span>
            <input
              type="radio"
              className="sr-only"
              name="themeType"
              value={option.value}
              checked={value.themeType === option.value}
              onChange={handleTypeChange}
            />
          </label>
        ))}
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-slate-600" htmlFor="themeValue">
          Valor do tema
        </label>
        <input
          id="themeValue"
          type="text"
          value={value.themeValue}
          onChange={handleValueChange}
          placeholder={
            value.themeType === 'solid'
              ? '#0ea5e9'
              : value.themeType === 'gradient'
              ? '135deg, #0ea5e9, #8b5cf6'
              : 'https://sua-imagem.com/fundo.png'
          }
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </div>
  );
};

export default ThemeSelector;
