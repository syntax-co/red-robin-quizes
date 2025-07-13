function IngredientInput({ idx, value, onChange, locked, state }) {
    /*
      state: 'neutral' | 'correct' | 'wrong'   (after submit)
    */
    const color =
      state === 'correct'
        ? 'bg-green-200 border-green-500'
        : state === 'wrong'
        ? 'bg-red-200 border-red-500'
        : 'bg-gray-100';
  
    return (
      <input
        type="text"
        placeholder={`Ingredient ${idx + 1}`}
        className={`w-full p-3 rounded-xl text-black text-lg border transition-all ${color}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={locked}
      />
    );
}


export default IngredientInput;