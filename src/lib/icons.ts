
/**
 * Utilitário para mapeamento inteligente de ícones do Material Symbols
 * baseado em palavras-chave no texto.
 */const iconMap: Record<string, string[]> = {
  // Lanches e Sanduíches
  'lunch_dining': ['lanche', 'hamburguer', 'burger', 'cheeseburger', 'sanduiche', 'artesanal', 'combo', 'xtudo'],
  'bakery_dining': ['pao', 'trigo', 'farinha', 'panko', 'rosca', 'baguete', 'bisnaga', 'paozinho'],
  
  // Condimentos e Ingredientes Adicionais
  'outdoor_grill': ['bacon', 'calabresa', 'grelhado', 'churrasco', 'linguica', 'brasa'],
  'eco': ['alface', 'picles', 'cebola', 'salada', 'rucula', 'cheiro verde', 'coentro', 'hortalica'],
  'grass': ['tomate', 'hortela', 'manjericao', 'erva', 'salsa', 'cebolinha', 'alecrim', 'vegetal', 'legume'],
  'local_pizza': ['mussarela', 'cheddar', 'queijo', 'gorgonzola', 'pizza', 'calzone', 'catupiry', 'provolone', 'margarita', 'pepperoni'],
  'egg_alt': ['ovo', 'omelete', 'mexido', 'codorna'],
  
  // Molhos e Temperos
  'blender': ['molho', 'maionese', 'mostarda', 'ketchup', 'katchup', 'barbecue', 'baconese', 'blister', 'copinho'],
  'science': ['paprica', 'corante', 'pasta', 'essencia', 'quimica', 'aditivo'],
  'grain': ['acucar', 'canela', 'sal', 'parrilha', 'pimenta', 'oregano', 'tempero', 'arroz', 'feijao', 'grao', 'semente'],
  
  // Carnes e Proteínas
  'set_meal': ['bife', 'carne', 'churrasco', 'picanha', 'steak', 'costela', 'porcao', 'petisco', 'alcatra', 'file', 'boi', 'suino', 'porco', 'peixe', 'camarao', 'frutos do mar', 'sushi', 'temaki', 'atum', 'salmao'],
  'kebab_dining': ['frango', 'nuggets', 'empanar', 'espeto', 'espetinho', 'ave', 'peito', 'coxa', 'asa', 'linguica', 'salsicha', 'tender'],
  'egg_alt': ['ovo', 'omelete', 'mexido', 'codorna'],
  
  // Acompanhamentos e Opcionais
  'fastfood': ['batata', 'frita', 'jenga', 'aneis', 'fast food', 'salgado', 'coxinha', 'kibe', 'pastel', 'hot-dog', 'hot dog', 'cachorro quente'],
  'local_pizza': ['mussarela', 'cheddar', 'queijo', 'gorgonzola', 'pizza', 'calzone', 'catupiry', 'provolone', 'margarita', 'pepperoni'],
  'ramen_dining': ['macarrao', 'pasta', 'espaguete', 'yakisoba', 'miojo'],
  
  // Sobremesas e Doces
  'cake': ['brownie', 'doce', 'bolo', 'torta', 'fatia', 'pudim', 'cupcake', 'confeitaria'],
  'icecream': ['sorvete', 'morango', 'tropical', 'ceu azul', 'blue ice', 'caramelo', 'amora', 'baunilha', 'picole', 'gelato', 'acai', 'casquinha', 'shake'],
  'cookie': ['marshmellow', 'balinha', 'bala', 'unicornio', 'chocolate', 'glitter', 'avela', 'nutella', 'churros', 'bolacha', 'biscoito', 'donut', 'rosquinha', 'bombom'],
  
  // Bebidas
  'local_drink': ['coca', 'guarana', 'sprite', 'schweppes', 'fanta', 'refrigerante', 'suco', 'agua', 'bebida', 'pepsi', 'kuat', 'garrafa', 'lata'],
  'bolt': ['monster', 'energetico', 'red bull', 'bally'],
  'sports_bar': ['cerveja', 'latao', 'chopp', 'breja', 'heineken', 'brahma', 'skol', 'amstel', 'vodka', 'gin', 'bebida alcoolica', 'tulipa'],
  'wine_bar': ['vinho', 'taca', 'champagne', 'espumante'],
  'liquor': ['whisky', 'licor', 'cachaça', 'pinga', 'destilado', 'tequila', 'rum', 'combo'],
  'ac_unit': ['gelo', 'congelado'],
  'water_drop': ['polpa', 'leite', 'creme de leite', 'leite condensado', 'gota', 'liquido', 'oléo', 'azeite', 'shoyu', 'mel'],
  'emoji_food_beverage': ['cafe', 'cha', 'quente', 'capuccino', 'mocha', 'expresso', 'bule', 'caneca'],
  'coffee': ['cafe', 'latte', 'expresso'],
  
  // Embalagens e Delivery
  'takeout_dining': ['sacola', 'delivery', 'sache', 'embalagem', 'marmita', 'quentinha', 'caixa', 'papelao'],
  'receipt_long': ['bobina', 'impressora', 'nota', 'cupom', 'papel', 'toalha', 'guardanapo', 'insulfilme', 'insufilme', 'plastico filme'],
  
  // Equipamentos, Cozinha e Manutenção
  'kitchen': ['cozinha', 'geladeira', 'fogao', 'chapa', 'freezer', 'refrigerador', 'forno'],
  'blender': ['liquidificador', 'batedeira', 'processador', 'mixer', 'fouet', 'bater'],
  'coffee_maker': ['cafeteira', 'maquina de cafe', 'maquina de expresso'],
  'microwave': ['microondas', 'micro-ondas'],
  'propane': ['gas', 'macarico', 'botijao', 'cilindro'],
  'flatware': ['espatula', 'talher', 'faca', 'colher', 'garfo', 'concha', 'pegador', 'tabua', 'cutelo'],
  'skillet': ['frigideira', 'panela', 'cacarola', 'tacho', 'escorredor', 'bowl', 'tigela'],
  'outdoor_grill': ['bacon', 'calabresa', 'grelhado', 'churrasco', 'linguica', 'brasa', 'grelha'],
  
  // Limpeza e Higiene
  'sanitizer': ['desinfetante', 'detergente', 'desengordurante', 'sapolio', 'alcool', 'limpeza', 'veja', 'multiuso', 'cloro', 'agua sanitaria', 'candida'],
  'cleaning_bucket': ['bucha', 'esponja', 'palha', 'aco', 'bombril', 'balde', 'mop', 'pano de chao', 'rodo', 'vassoura', 'pá'],
  'delete': ['saco', 'lixo', 'lixeira', 'descarte'],
  'wash': ['sabao', 'sabonete', 'lenco', 'umidecido', 'fio dental', 'amaciante', 'lava roupas'],
  'wc': ['banheiro', 'higienico', 'absorvente', 'papel higienico', 'mictorio', 'vaso'],
  'spa': ['desodorante', 'aromatizante', 'bom ar', 'perfume', 'cosmetico', 'shampoo', 'condicionador', 'creme'],
  'hardware': ['palito', 'dente', 'ferramenta', 'martelo', 'chave', 'prego', 'parafuso'],
  'build': ['manutencao', 'conserto', 'reparo', 'oficina'],
  
  // Outros e Setores
  'inventory': ['geral', 'almoxarifado', 'deposito', 'estoque', 'armazen', 'inventario'],
  'room_service': ['servico', 'lanche', 'quarto', 'hotelaria', 'hospedagem'],
  'group': ['cliente', 'mesa', 'atendimento', 'staff', 'equipe', 'funcionario', 'pessoal', 'rh'],
  'payments': ['caixa', 'pagamento', 'financeiro', 'venda', 'faturamento', 'dinheiro', 'cartao', 'pix', 'troco'],
  'shopping_cart': ['compra', 'supermercado', 'carrinho', 'loja'],
  'storefront': ['fachada', 'vitrine', 'loja fisica', 'ponto de venda', 'pdv'],
  'local_shipping': ['frete', 'entrega', 'entregador', 'caminhao', 'transporte', 'logistica', 'motoboy', 'ifood'],
  'schedule': ['horario', 'turno', 'escala', 'agendamento', 'relogio', 'tempo', 'prazo'],
  'health_and_safety': ['epi', 'seguranca', 'luva', 'mascara', 'avental', 'bota', 'touca', 'rede', 'jaleco'],
  'medical_services': ['primeiros socorros', 'curativo', 'band-aid', 'remedio', 'medicamento', 'farmacia'],
  'event': ['festa', 'evento', 'reserva', 'confraternizacao'],
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
  'nutrition', 'cooking', 'pot_holder', 'kettle', 'toaster', 'taco', 'burrito',
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
  const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const normalizedText = normalize(text);
  
  for (const [icon, keywords] of Object.entries(iconMap)) {
    if (keywords.some(k => normalizedText.includes(normalize(k)))) {
      return icon;
    }
  }
  
  // Opcionalmente podemos procurar correspondência aproximada aqui (fuzzy matching), 
  // por enquanto o inclui() vai pegar se for substring.
  
  // Default fallback por contexto
  if (normalizedText.length < 3) return 'category';
  return 'inventory_2';
}
