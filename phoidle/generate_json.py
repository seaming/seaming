import pandas as pd

phoible = (pd.read_csv(
    "https://github.com/phoible/dev/raw/master/data/phoible.csv",
    low_memory=False)
    .groupby('Glottocode')['Phoneme']
    .apply(list)
    .to_frame(name='Phonemes'))

glottolog = pd.read_csv(
    "https://github.com/glottolog/glottolog-cldf/raw/master/cldf/"
    "languages.csv")

families = (
    glottolog
    .merge(glottolog, left_on='ID', right_on='Family_ID')[['ID_y', 'Name_x']]
    .rename(columns={'Name_x': 'Family_Name', 'ID_y': 'ID'}))

glottolog = glottolog.merge(families, left_on='ID', right_on='ID')

(phoible
 .merge(glottolog, left_on='Glottocode', right_on='ID')[
     ['Phonemes', 'ID', 'Name', 'Family_Name',
      'Macroarea', 'Latitude', 'Longitude']]
 .set_index('ID')
 .to_json('data.json', orient='index'))
