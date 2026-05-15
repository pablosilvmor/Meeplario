
/**
 * Utilitário para mapeamento inteligente de ícones do Material Symbols
 * baseado em palavras-chave no texto.
 */

const iconMap: Record<string, string[]> = {
  // Lanches e Sanduíches
  'lunch_dining': ['lanche', 'hamburguer', 'burger', 'cheeseburger', 'sanduíche', 'artesanal'],
  'bakery_dining': ['pão', 'trigo', 'farinha', 'panko'],
  
  // Condimentos e Ingredientes Adicionais
  'outdoor_grill': ['bacon'],
  'eco': ['alface', 'picles', 'cebola'],
  'local_pizza': ['mussarela', 'cheddar', 'queijo', 'gorgonzola', 'pizza', 'calzone'],
  'egg_alt': ['ovo', 'omelete', 'mexido'],
  'grass': ['tomate', 'hortelã'],
  
  // Molhos
  'blender': ['molho', 'maionese', 'mostarda', 'ketchup', 'katchup', 'barbecue', 'baconese', 'blister', 'copinho'],
  'science': ['páprica', 'corante', 'pasta'],

  // Carnes
  'set_meal': ['bife', 'carne', 'churrasco', 'picanha', 'steak', 'costela', 'porção', 'petisco'],
  'kebab_dining': ['frango', 'nuggets', 'empanar', 'linguiça'],
  
  // Acompanhamentos e Opcionais
  'fastfood': ['batata', 'frita', 'jenga', 'aneis'],
  'grain': ['açúcar', 'açucar', 'canela', 'sal', 'parrilha'],
  
  // Sobremesas
  'cake': ['brownie', 'doce', 'bolo'],
  'icecream': ['sorvete', 'morango', 'tropical', 'céu azul', 'blue ice', 'caramelo', 'amora', 'baunilha'],
  'cookie': ['marshmellow', 'balinha', 'bala', 'unicórnio', 'chocolate', 'glitter', 'avelã', 'nutella', 'churros'],
  
  // Bebidas
  'local_drink': ['coca', 'guaraná', 'sprite', 'schweppes', 'fanta', 'refrigerante', 'suco', 'água', 'bebida'],
  'bolt': ['monster', 'energético'],
  'sports_bar': ['cerveja', 'latão', 'chopp', 'breja'],
  'ac_unit': ['gelo'],
  'water_drop': ['polpa', 'leite'],
  'emoji_food_beverage': ['café', 'chá', 'quente'],

  // Embalagens e Delivery
  'takeout_dining': ['sacola', 'delivery', 'sachê'],
  'receipt_long': ['bobina', 'impressora', 'nota', 'cupom', 'papel', 'toalha', 'guardanapo', 'insulfilme', 'insufilme'],
  
  // Cozinha e Limpeza
  'propane': ['gás', 'maçarico'],
  'sanitizer': ['desinfetante', 'detergente', 'desengordurante', 'sapólio', 'álcool', 'limpeza'],
  'cleaning_bucket': ['bucha', 'esponja', 'palha', 'aço'],
  'delete': ['saco', 'lixo', 'lixeira'],
  'flatware': ['espátula', 'talher', 'faca', 'colher'],
  'hardware': ['palito', 'dente'],
  
  // Banheiro
  'wc': ['banheiro', 'higiênico', 'higienico', 'absorvente'],
  'wash': ['sabão', 'sabonete', 'lenço', 'umidecido', 'fio dental'],
  'spa': ['desodorante', 'aromatizante', 'bom ar'],

  // Outros e Setores
  'inventory': ['geral', 'almoxarifado', 'depósito'],
  'room_service': ['serviço', 'lanche', 'quarto'],
  'group': ['cliente', 'mesa', 'atendimento', 'staff'],
  'payments': ['caixa', 'pagamento', 'financeiro', 'venda', 'vaturamento'],
  'kitchen': ['cozinha', 'geladeira', 'fogão', 'chapa'],
};

export const availableIcons = Array.from(new Set([
  ...Object.keys(iconMap),
  // Food & Drinks
  'restaurant', 'restaurant_menu', 'local_dining', 'local_cafe', 'local_bar',
  'cake', 'icecream', 'fastfood', 'local_pizza', 'brunch_dining', 'dinner_dining',
  'takeout_dining', 'tapas', 'wine_bar', 'liquor', 'coffee', 'coffee_maker',
  'microwave', 'soup_kitchen', 'ramen_dining', 'local_fire_department', 'grilling',
  'set_meal', 'bento', 'bakery_dining', 'breakfast_dining', 'cookie', 'kebab_dining',
  'egg', 'egg_alt', 'flatware', 'local_drink', 'water_drop', 'eco', 'grass',
  'ice_cream', 'blender', 'deck', 'patio', 'emoji_food_beverage', 'emoji_nature',
  'free_breakfast', 'room_service', 'nightlife', 'sports_bar', 'skillet',
  'grocery_store', 'store', 'storefront', 'shopping_bag', 'shopping_cart',
  
  // Kitchen & Appliances
  'kitchen', 'propane', 'hardware', 'fire_extinguisher', 'local_laundry_service',
  'wash', 'sanitizer', 'cleaning_bucket', 'sanitizer', 'ac_unit', 'thermostat',

  // Animals & Nature (used for meats sometimes)
  'pets', 'cruelty_free', 'phishing', 'set_meal', 'eco', 'nature', 'landscape',
  'forest', 'agriculture', 'spa', 'water',

  // Commerce & Admin
  'category', 'inventory_2', 'receipt', 'receipt_long', 'point_of_sale',
  'money', 'attach_money', 'credit_card', 'payments', 'account_balance',
  'account_balance_wallet', 'calculate', 'bar_chart', 'trending_up',
  'analytics', 'pie_chart', 'monitoring', 'schedule', 'event', 'calendar_today',
  'done', 'done_all', 'check', 'check_circle', 'cancel', 'close', 'delete',
  'delete_outline', 'edit', 'edit_square', 'add', 'add_circle', 'remove',
  'remove_circle', 'warning', 'error', 'info', 'help', 'search', 'settings',
  'star', 'favorite', 'thumb_up', 'thumb_down', 'visibility', 'visibility_off',
  'lock', 'lock_open', 'key', 'person', 'people', 'group', 'public', 'language',
  
  // Navigation & UI
  'location_on', 'map', 'place', 'home', 'dashboard', 'menu', 'menu_book',
  'list', 'list_alt', 'format_list_bulleted', 'format_list_numbered', 'view_list',
  'view_module', 'view_comfy', 'grid_view', 'apps', 'more_vert', 'more_horiz',
  'arrow_back', 'arrow_forward', 'arrow_upward', 'arrow_downward', 'chevron_left',
  'chevron_right', 'expand_less', 'expand_more', 'first_page', 'last_page',
  'refresh', 'sync', 'file_download', 'file_upload', 'cloud', 'cloud_download',
  'cloud_upload', 'folder', 'folder_open', 'description', 'article', 'note',
  'mail', 'email', 'send', 'inbox', 'chat', 'chat_bubble', 'forum', 'phone',
  'call', 'smartphone', 'devices', 'computer', 'laptop', 'desktop_windows',
  'watch', 'camera', 'photo_camera', 'image', 'photo', 'collections', 'music_note',
  'audiotrack', 'volume_up', 'volume_down', 'volume_mute', 'volume_off', 'mic',
  'mic_off', 'videocam', 'videocam_off', 'play_arrow', 'pause', 'stop', 'skip_next',
  'skip_previous', 'fast_forward', 'fast_rewind', 'directions_car', 'local_shipping',
  'flight', 'train', 'directions_transit', 'directions_bike', 'directions_walk',
  'local_taxi', 'local_parking', 'local_gas_station', 'ev_station', 'hotel',
  
  // Miscelaneous Utilities
  'local_hospital', 'local_pharmacy', 'local_offer', 'card_giftcard', 'card_travel', 
  'work', 'business', 'business_center', 'apartment', 'build', 'construction', 
  'engineering', 'science', 'biotech', 'emoji_emotions', 'emoji_events',
  'emoji_objects', 'emoji_symbols', 'emoji_transportation', 'sports_soccer', 
  'sports_basketball', 'sports_tennis', 'sports_baseball', 'sports_volleyball', 
  'fitness_center', 'pool', 'directions_run', 'health_and_safety', 'safety_divider', 
  'coronavirus', 'masks', 'clean_hands', 'soap', 'bathtub', 'shower', 'dry_cleaning', 
  'water_damage', 'flood', 'thunderstorm', 'wb_sunny', 'nightlight', 'dark_mode', 
  'light_mode', 'bed', 'king_bed', 'single_bed', 'crib', 'living', 'weekend', 
  'desk', 'chair', 'chair_alt', 'pest_control', 'yard', 'umbrella', 'luggage',
  'vaccines', 'medical_services', 'bloodtype', 'monitor_weight', 'device_thermostat', 
  'lightbulb', 'electric_bolt', 'energy_savings_leaf', 'smart_display', 'speaker', 
  'headphones', 'earbuds', 'headset', 'inventory', 'qr_code', 'sell', 'discount',
  'verified', 'shield', 'wifi', 'bluetooth', 'vpn_key', 'print', 'fax'
]));

export function getSmartIcon(text: string): string {
  const lowerText = text.toLowerCase().trim();
  
  for (const [icon, keywords] of Object.entries(iconMap)) {
    if (keywords.some(k => lowerText.includes(k))) {
      return icon;
    }
  }
  
  // Default fallback por contexto
  if (lowerText.length < 3) return 'category';
  return 'inventory_2';
}
