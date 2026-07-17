# Corpus fixtures

Real-world MusicXML files (MuseScore/Sibelius/Finale exports of
public-domain music, plus OSMD's synthetic feature tests) copied from the
[OpenSheetMusicDisplay test data](https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/tree/develop/test/data)
(BSD-3-Clause). They exist to feed the importer files we did NOT write —
`tests/corpus/corpus.test.tsx` checks that every file parses without
throwing, renders to markup with a plausible number of note events, and
that the importer's skip-warnings stay tracked in a snapshot.

When the importer learns a new element, re-run with `-u` and review the
warning diff — warnings should only ever disappear.
