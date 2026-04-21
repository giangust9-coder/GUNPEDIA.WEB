import json

# Weapons used in World War I (1914-1918)
wwi_weapons = [
    # Rifles and Carbines
    "Lee-Enfield", "Mauser Kar 98k", "Mosin-Nagant", "Springfield M1903",
    "Rifle Ross", "Mannlicher M1895", "Lebel Model 1886",

    # Machine Guns
    "Maxim (ametralladora)", "Lewis (ametralladora)", "Vickers (ametralladora)",
    "Browning M1917", "Browning M1919", "MG 08", "Hotchkiss M1914",
    "Schwarzlose MG M.07/12",

    # Artillery
    "BL 6-inch Mk VII naval gun", "Paris Gun", "Big Bertha",

    # Aircraft (WWI era)
    "Fokker Dr.I", "Sopwith Camel", "Albatros D.III", "SPAD S.XIII",
    "Nieuport 17", "Royal Aircraft Factory S.E.5",

    # Tanks (WWI era)
    "Mark I (tanque)", "Mark IV (tanque)", "Renault FT", "A7V",
    "Whippet (tanque)", "Saint-Chamond",

    # Naval vessels (WWI era)
    "HMS Dreadnought", "SMS Derfflinger", "USS New York (BB-34)",
    "Clase König", "Clase Queen Elizabeth",

    # Submarines
    "U-boat Type U-9", "USS G-4",

    # Handguns
    "Luger P08", "Colt M1911", "Webley Mk VI", "Mauser C96",

    # Grenades and explosives
    "Mills Bomb", "Stielhandgranate"
]

# Weapons used in World War II (1939-1945)
wwii_weapons = [
    # Rifles and Carbines (continued from WWI plus new designs)
    "Lee-Enfield", "Mauser Kar 98k", "Mosin-Nagant", "Springfield M1903",
    "Karabiner 98k", "Gewehr 41", "Gewehr 43", "M1 Garand", "SVT-40",
    "Tokarev SVT-40",

    # Submachine Guns (WWII era)
    "MP40", "Thompson (subfusil)", "PPSh-41", "PPS-43", "Sten",
    "Owen Gun", "M3 (subfusil)", "M1 Thompson",

    # Machine Guns
    "Maxim (ametralladora)", "Lewis (ametralladora)", "Vickers (ametralladora)",
    "Browning M1919", "Browning M1917", "MG42", "MG34", "DP-28",
    "Bren (ametralladora)", "Type 99 (ametralladora)",

    # Aircraft (WWII era)
    "Messerschmitt Bf 109", "Focke-Wulf Fw 190", "Supermarine Spitfire",
    "Hawker Hurricane", "P-51 Mustang", "P-47 Thunderbolt", "P-38 Lightning",
    "Mitsubishi A6M Zero", "Nakajima Ki-43", "Ilyushin Il-2", "Junkers Ju 87",
    "Junkers Ju 88", "Heinkel He 111", "Boeing B-17 Flying Fortress",
    "Consolidated B-24 Liberator", "Avro Lancaster", "de Havilland Mosquito",

    # Tanks (WWII era)
    "Panzer I", "Panzer II", "Panzer III", "Panzer IV", "Panzer V Panther",
    "Panzer VI Tiger", "Panzer VI Tiger II", "M3 Stuart", "M3 Lee",
    "M4 Sherman", "M26 Pershing", "Cromwell (tanque)", "Churchill (tanque)",
    "Matilda II", "Valentine (tanque)", "T-34", "KV-1", "IS-2",
    "IS-3", "T-26", "BT-7", "Somua S-35", "Char B1", "Type 97 Chi-Ha",
    "Tipo 95 Ha-Go", "M11/39",

    # Self-propelled guns and tank destroyers
    "StuG III", "Jagdpanzer IV", "Marder III", "Hetzer", "SU-85",
    "SU-100", "SU-152",

    # Armored vehicles
    "Sd.Kfz. 251", "M3 Half-track", "Universal Carrier", "BA-64",

    # Artillery
    "Nebelwerfer", "Katyusha", "M777 howitzer", "BL 6-inch Mk VII naval gun",

    # Naval vessels (WWII era)
    "Clase Yamato", "Clase Iowa", "Clase Bismarck", "Clase Littorio",
    "Clase Richelieu", "Clase King George V", "Clase North Carolina",
    "Clase South Dakota", "Clase Nelson", "HMS Hood", "Clase Scharnhorst",
    "Clase Graf Spee", "Acorazado Gangut", "USS Enterprise (CV-6)",
    "HMS Ark Royal", "Bismarck", "Tirpitz", "Yamato", "Musashi",

    # Anti-aircraft guns
    "Flak 88", "Bofors 40mm", "Oerlikon 20mm",

    # Anti-tank weapons
    "Panzerfaust", "Bazooka", "PIAT", "RPG-43",

    # Handguns
    "Luger P08", "Colt M1911", "Walther P38", "Tokarev TT-33",
    "Mauser C96", "Webley Mk VI", "Browning Hi-Power",

    # Grenades and explosives
    "Mills Bomb", "Stielhandgranate", "Mk 2 grenade", "RG-42"
]

# Read the JSON file
with open('armas.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# First, remove any incorrectly assigned world wars
for weapon in data:
    weapon['wars'] = [war for war in weapon['wars'] if war not in ['Primera Guerra Mundial', 'Segunda Guerra Mundial']]

# Add WWI and WWII to appropriate weapons
for weapon in data:
    weapon_name = weapon['name']

    # Add Primera Guerra Mundial if weapon was used in WWI
    if weapon_name in wwi_weapons:
        if 'Primera Guerra Mundial' not in weapon['wars']:
            weapon['wars'].append('Primera Guerra Mundial')

    # Add Segunda Guerra Mundial if weapon was used in WWII
    if weapon_name in wwii_weapons:
        if 'Segunda Guerra Mundial' not in weapon['wars']:
            weapon['wars'].append('Segunda Guerra Mundial')

# Write back the updated JSON
with open('armas.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✓ Corrected Primera Guerra Mundial and Segunda Guerra Mundial assignments for {len(data)} weapons.")