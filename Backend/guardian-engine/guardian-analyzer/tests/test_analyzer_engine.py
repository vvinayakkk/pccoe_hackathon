import copy
from abc import ABC
from contextlib import nullcontext
from typing import List, Optional
import re

import pytest

from guardian_analyzer import (
    AnalyzerEngine,
    PatternRecognizer,
    Pattern,
    RecognizerRegistry,
    EntityRecognizer,
    RecognizerResult,
)
from guardian_analyzer.nlp_engine import (
    NlpArtifacts,
    SpacyNlpEngine,
)
from guardian_analyzer.recognizer_registry import (
    RecognizerRegistryProvider
)

# noqa: F401
from tests import assert_result
from tests.mocks import NlpEngineMock, AppTracerMock, RecognizerRegistryMock


@pytest.fixture(scope="module")
def app_tracer():
    return AppTracerMock(enable_decision_process=True)


@pytest.fixture(scope="module")
def loaded_analyzer_engine(loaded_registry, app_tracer):
    mock_nlp_artifacts = NlpArtifacts([], [], [], [], None, "en")
    analyzer_engine = AnalyzerEngine(
        loaded_registry,
        NlpEngineMock(stopwords=[], punct_words=[], nlp_artifacts=mock_nlp_artifacts),
        app_tracer=app_tracer,
        log_decision_process=True,
    )
    return analyzer_engine


@pytest.fixture(scope="module")
def zip_code_deny_list_recognizer():
    regex = r"(\b\d{5}(?:\-\d{4})?\b)"
    zipcode_pattern = Pattern(name="zip code (weak)", regex=regex, score=0.01)
    zip_recognizer = PatternRecognizer(
        supported_entity="ZIP", deny_list=["999"], patterns=[zipcode_pattern]
    )
    return zip_recognizer


@pytest.fixture(scope="module")
def unit_test_guid():
    return "00000000-0000-0000-0000-000000000000"


def test_simple():
    dic = {
        "text": "John Smith drivers license is AC432223",
        "language": "en",
        "score_threshold": 0.7,
        "entities": ["CRYPTO", "NRP", "DATE_TIME", "LOCATION", "PERSON"],
    }

    analyzer = AnalyzerEngine()
    analyzer.analyze(**dic)


def test_when_analyze_with_predefined_recognizers_then_return_results(
    loaded_analyzer_engine, unit_test_guid, max_score
):
    text = " Credit card: 4095-2609-9393-4932,  my phone is 425 8829090"
    language = "en"
    entities = ["CREDIT_CARD"]
    results = loaded_analyzer_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language=language,
    )

    assert len(results) == 1
    assert_result(results[0], "CREDIT_CARD", 14, 33, max_score)

@pytest.mark.parametrize(
    "registry_config,analyzer_lang,expectation",
    [
        ({"supported_languages": ["en"]}, ["es", "de"], pytest.raises(ValueError)),
        (None, ["es", "de"], pytest.raises(ValueError)),
        ({"supported_languages": ["es", "de"]}, None, pytest.raises(ValueError)),
        ({"supported_languages": ["es", "de"]}, ["de", "es"], nullcontext()),
        (None, None, nullcontext()),
    ]
)
def test_when_analyze_with_unsupported_language_must_match(registry_config, analyzer_lang, expectation):
    with expectation:
        registry = RecognizerRegistryProvider(registry_configuration=registry_config).create_recognizer_registry()
        AnalyzerEngine(
            registry=registry,
            supported_languages=analyzer_lang,
            nlp_engine=NlpEngineMock(),
        )

def test_when_analyze_with_defaults_success(
):
    registry = RecognizerRegistryProvider().create_recognizer_registry()
    AnalyzerEngine(registry=registry)

def test_when_analyze_with_multiple_predefined_recognizers_then_succeed(
    loaded_registry, unit_test_guid, spacy_nlp_engine, max_score
):
    text = " Credit card: 4095-2609-9393-4932,  my phone is 425 8829090"
    language = "en"
    entities = ["CREDIT_CARD", "PHONE_NUMBER"]

    analyzer_engine_with_spacy = AnalyzerEngine(
        registry=loaded_registry, nlp_engine=spacy_nlp_engine
    )
    results = analyzer_engine_with_spacy.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language=language,
    )

    assert len(results) == 2
    medium_regex_score = 0.4
    context_similarity_factor = 0.35  # PatternRecognizer.CONTEXT_SIMILARITY_FACTOR
    assert_result(results[0], "CREDIT_CARD", 14, 33, max_score)
    expected_score = medium_regex_score + context_similarity_factor
    assert_result(results[1], "PHONE_NUMBER", 48, 59, expected_score)


def test_when_analyze_with_empty_text_then_no_results(
    loaded_analyzer_engine, unit_test_guid
):
    language = "en"
    text = ""
    entities = ["CREDIT_CARD", "PHONE_NUMBER"]
    results = loaded_analyzer_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language=language,
    )

    assert len(results) == 0


def test_when_analyze_with_unsupported_language_then_fail(
    loaded_analyzer_engine, unit_test_guid
):
    with pytest.raises(ValueError):
        language = "de"
        text = ""
        entities = ["CREDIT_CARD", "PHONE_NUMBER"]
        loaded_analyzer_engine.analyze(
            correlation_id=unit_test_guid,
            text=text,
            entities=entities,
            language=language,
        )


def test_when_analyze_two_entities_embedded_then_return_results(spacy_nlp_engine):
    analyzer = AnalyzerEngine(nlp_engine=spacy_nlp_engine)

    # Name with driver license in it
    text = "My name is John 1234567 Doe"
    results = analyzer.analyze(text=text, language="en", score_threshold=0)

    # currently we only remove duplicates when the two have the same entity type
    assert len(results) == 2


def test_when_analyze_added_pattern_recognizer_then_succeed(unit_test_guid):
    pattern = Pattern("rocket pattern", r"\W*(rocket)\W*", 0.8)
    pattern_recognizer = PatternRecognizer(
        "ROCKET", name="Rocket recognizer", patterns=[pattern]
    )

    mock_recognizer_registry = RecognizerRegistryMock()
    # Make sure the analyzer doesn't get this entity
    analyze_engine = AnalyzerEngine(
        registry=mock_recognizer_registry,
        nlp_engine=NlpEngineMock(),
    )
    text = "rocket is my favorite transportation"
    entities = ["CREDIT_CARD", "ROCKET"]

    results = analyze_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language="en",
    )

    assert len(results) == 0

    # Add a new recognizer for the word "rocket" (case insensitive)
    mock_recognizer_registry.add_recognizer(pattern_recognizer)

    # Check that the entity is recognized:
    results = analyze_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language="en",
    )

    assert len(results) == 1
    assert_result(results[0], "ROCKET", 0, 7, 0.8)


def test_when_allow_list_specified(loaded_analyzer_engine):
    text = "bing.com is his favorite website, microsoft.com is his second favorite"
    results = loaded_analyzer_engine.analyze(
        text=text,
        language="en",
    )
    assert len(results) == 2
    assert_result(results[0], "URL", 0, 8, 0.5)

    results = loaded_analyzer_engine.analyze(
        text=text, language="en", allow_list=["bing.com"]
    )
    assert len(results) == 1
    assert text[results[0].start : results[0].end] == "microsoft.com"


def test_when_allow_list_specified_but_none_in_file(loaded_analyzer_engine):

    text = "bing.com is his favorite website"
    results = loaded_analyzer_engine.analyze(
        text=text,
        language="en",
    )
    assert len(results) == 1
    assert_result(results[0], "URL", 0, 8, 0.5)

    results = loaded_analyzer_engine.analyze(
        text=text,
        language="en",
        allow_list=["microsoft.com"],
    )
    assert len(results) == 1
    assert_result(results[0], "URL", 0, 8, 0.5)


def test_when_allow_list_specified_multiple_items(loaded_analyzer_engine):
    text = "bing.com is his favorite website, microsoft.com is his second favorite"

    results = loaded_analyzer_engine.analyze(
        text=text,
        language="en",
        allow_list=["bing.com", "microsoft.com"],
    )
    assert len(results) == 0


def test_when_regex_allow_list_specified(loaded_analyzer_engine):
    text = "bing.com is his favorite website, microsoft.com is his second favorite, azure.com is his third favorite"
    results = loaded_analyzer_engine.analyze(
        text=text,
        language="en",
    )
    assert len(results) == 3
    assert_result(results[0], "URL", 0, 8, 0.5)

    results = loaded_analyzer_engine.analyze(
        text=text, language="en", allow_list=["bing"], allow_list_match = "regex"
    )
    assert len(results) == 2
    assert text[results[0].start : results[0].end] == "microsoft.com"
    assert text[results[1].start : results[1].end] == "azure.com"


def test_when_regex_allow_list_specified_but_none_in_file(loaded_analyzer_engine):

    text = "bing.com is his favorite website"
    results = loaded_analyzer_engine.analyze(
        text=text,
        language="en",
    )
    assert len(results) == 1
    assert_result(results[0], "URL", 0, 8, 0.5)

    results = loaded_analyzer_engine.analyze(
        text=text, language="en", allow_list=["microsoft"], allow_list_match = "regex"
    )
    assert len(results) == 1
    assert_result(results[0], "URL", 0, 8, 0.5)


def test_when_regex_allow_list_specified_multiple_items_with_missing_flags(loaded_analyzer_engine):
    text = "bing.com is his favorite website, microsoft.com is his second favorite, azure.com is his third favorite"
    results = loaded_analyzer_engine.analyze(
        text=text,
        language="en",
    )
    assert len(results) == 3
    assert_result(results[0], "URL", 0, 8, 0.5)

    results = loaded_analyzer_engine.analyze(
        text=text, language="en", allow_list=["bing", "microsoft"], allow_list_match = "regex", 
    )
    assert len(results) == 1
    assert text[results[0].start : results[0].end] == "azure.com"


def test_when_regex_allow_list_specified_with_regex_flags(loaded_analyzer_engine):
    text = "bing.com is his favorite website, microsoft.com is his second favorite, azure.com is his third favorite"
    results = loaded_analyzer_engine.analyze(
        text=text,
        language="en",
    )
    assert len(results) == 3
    assert_result(results[0], "URL", 0, 8, 0.5)

    results = loaded_analyzer_engine.analyze(
        text=text, language="en", allow_list=["BING", "MICROSOFT", "AZURE"], allow_list_match = "regex", regex_flags=0
    )
    assert len(results) == 3

    results = loaded_analyzer_engine.analyze(
        text=text, language="en", allow_list=["BING", "MICROSOFT", "AZURE"], allow_list_match = "regex", regex_flags=re.IGNORECASE
    )
    assert len(results) == 0


def test_when_removed_pattern_recognizer_then_doesnt_work(unit_test_guid):
    pattern = Pattern("spaceship pattern", r"\W*(spaceship)\W*", 0.8)
    pattern_recognizer = PatternRecognizer(
        "SPACESHIP", name="Spaceship recognizer", patterns=[pattern]
    )

    mock_recognizer_registry = RecognizerRegistryMock()

    # Make sure the analyzer doesn't get this entity
    analyze_engine = AnalyzerEngine(
        registry=mock_recognizer_registry,
        nlp_engine=NlpEngineMock(),
    )
    text = "spaceship is my favorite transportation"
    entities = ["CREDIT_CARD", "SPACESHIP"]

    results = analyze_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language="en",
    )

    assert len(results) == 0

    # Add a new recognizer for the word "rocket" (case insensitive)
    mock_recognizer_registry.add_recognizer(pattern_recognizer)
    # Check that the entity is recognized:
    results = analyze_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language="en",
    )
    assert len(results) == 1
    assert_result(results[0], "SPACESHIP", 0, 10, 0.8)

    # Remove recognizer
    mock_recognizer_registry.remove_recognizer("Spaceship recognizer")
    # Test again to see we didn't get any results
    results = analyze_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language="en",
    )

    assert len(results) == 0


def test_when_analyze_with_language_then_returns_correct_response(
    loaded_analyzer_engine,
):
    language = "en"
    entities = ["CREDIT_CARD"]
    min_score = 0.5
    text = "My credit card number is 4916994465041084"
    response = loaded_analyzer_engine.analyze(
        text=text,
        language=language,
        entities=entities,
        score_threshold=min_score,
    )

    assert response is not None


def test_when_entities_is_none_then_return_all_fields(loaded_registry):
    analyze_engine = AnalyzerEngine(
        registry=loaded_registry, nlp_engine=NlpEngineMock()
    )
    threshold = 0
    text = (
        " Credit card: 4095-2609-9393-4932,  my phone is 425 8829090 "
        "Domain: microsoft.com"
    )
    response = analyze_engine.analyze(
        text=text, score_threshold=threshold, language="en"
    )
    returned_entities = [response.entity_type for response in response]

    assert response is not None
    assert "CREDIT_CARD" in returned_entities
    assert "PHONE_NUMBER" in returned_entities
    assert "URL" in returned_entities


def test_when_entities_is_none_all_recognizers_loaded_then_return_all_fields(
        spacy_nlp_engine,
):
    analyze_engine = AnalyzerEngine(
        registry=RecognizerRegistry(), nlp_engine=spacy_nlp_engine
    )
    threshold = 0
    text = "My name is Sharon and I live in Seattle." "Domain: microsoft.com "
    response = analyze_engine.analyze(
        text=text, score_threshold=threshold, language="en"
    )
    returned_entities = [response.entity_type for response in response]

    assert response is not None
    assert "PERSON" in returned_entities
    assert "LOCATION" in returned_entities
    assert "URL" in returned_entities


def test_when_analyze_then_apptracer_has_value(
    loaded_registry, unit_test_guid, spacy_nlp_engine
):
    text = "My name is Bart Simpson, and Credit card: 4095-2609-9393-4932,  my phone is 425 8829090"  # noqa E501
    language = "en"
    entities = ["CREDIT_CARD", "PHONE_NUMBER", "PERSON"]
    app_tracer_mock = AppTracerMock(enable_decision_process=True)
    analyzer_engine_with_spacy = AnalyzerEngine(
        loaded_registry,
        app_tracer=app_tracer_mock,
        log_decision_process=True,
        nlp_engine=spacy_nlp_engine,
    )
    results = analyzer_engine_with_spacy.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language=language,
        return_decision_process=True,
    )
    assert len(results) == 3
    for result in results:
        assert result.analysis_explanation is not None
    assert app_tracer_mock.get_msg_counter() == 2
    assert app_tracer_mock.get_last_trace() is not None


def test_when_threshold_is_zero_then_all_results_pass(loaded_registry, unit_test_guid):
    text = " Credit card: 4095-2609-9393-4932,  my phone is 425 8829090"
    language = "en"
    entities = ["CREDIT_CARD", "PHONE_NUMBER"]

    # This analyzer engine is different from the global one, as this one
    # also loads SpaCy so it can detect the phone number entity

    analyzer_engine = AnalyzerEngine(
        registry=loaded_registry, nlp_engine=NlpEngineMock()
    )
    results = analyzer_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language=language,
        score_threshold=0,
    )

    assert len(results) == 2


def test_when_threshold_is_more_than_half_then_only_credit_card_passes(
    loaded_registry, unit_test_guid
):
    text = " Credit card: 4095-2609-9393-4932,  my phone is 425 8829090"
    language = "en"
    entities = ["CREDIT_CARD", "PHONE_NUMBER"]

    # This analyzer engine is different from the global one, as this one
    # also loads SpaCy so it can detect the phone number entity

    analyzer_engine = AnalyzerEngine(
        registry=loaded_registry, nlp_engine=NlpEngineMock()
    )
    results = analyzer_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language=language,
        score_threshold=0.51,
    )

    assert len(results) == 1


def test_when_default_threshold_is_more_than_half_then_only_one_passes(
    loaded_registry, unit_test_guid
):
    text = " Credit card: 4095-2609-9393-4932,  my phone is 425 8829090"
    language = "en"
    entities = ["CREDIT_CARD", "PHONE_NUMBER"]

    # This analyzer engine is different from the global one, as this one
    # also loads SpaCy so it can detect the phone number entity

    analyzer_engine = AnalyzerEngine(
        registry=loaded_registry,
        nlp_engine=NlpEngineMock(),
        default_score_threshold=0.7,
    )
    results = analyzer_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language=language,
    )

    assert len(results) == 1


def test_when_default_threshold_is_zero_then_all_results_pass(
    loaded_registry, unit_test_guid
):
    text = " Credit card: 4095-2609-9393-4932,  my phone is 425 8829090"
    language = "en"
    entities = ["CREDIT_CARD", "PHONE_NUMBER"]

    # This analyzer engine is different from the global one, as this one
    # also loads SpaCy so it can detect the phone number entity

    analyzer_engine = AnalyzerEngine(
        registry=loaded_registry, nlp_engine=NlpEngineMock()
    )
    results = analyzer_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        entities=entities,
        language=language,
    )

    assert len(results) == 2


def test_when_get_supported_fields_then_return_all_languages(
    analyzer_engine_simple, unit_test_guid
):

    entities = analyzer_engine_simple.get_supported_entities()

    assert len(entities) == 3
    assert "CREDIT_CARD" in entities
    assert "URL" in entities
    assert "PHONE_NUMBER" in entities


def test_when_get_supported_fields_specific_language_then_return_single_result(
    loaded_registry, unit_test_guid, spacy_nlp_engine
):
    pattern = Pattern("rocket pattern", r"\W*(rocket)\W*", 0.8)
    pattern_recognizer = PatternRecognizer(
        "ROCKET",
        name="Rocket recognizer RU",
        patterns=[pattern],
        supported_language="ru",
    )

    analyzer = AnalyzerEngine(registry=loaded_registry, nlp_engine=spacy_nlp_engine)
    analyzer.registry.add_recognizer(pattern_recognizer)
    entities = analyzer.get_supported_entities(language="ru")

    assert len(entities) == 1
    assert "ROCKET" in entities


def test_when_get_recognizers_then_returns_supported_language():
    pattern = Pattern("rocket pattern", r"\W*(rocket)\W*", 0.8)
    pattern_recognizer = PatternRecognizer(
        "ROCKET",
        name="Rocket recognizer RU",
        patterns=[pattern],
        supported_language="ru",
    )
    mock_recognizer_registry = RecognizerRegistryMock()
    mock_recognizer_registry.add_recognizer(pattern_recognizer)
    analyze_engine = AnalyzerEngine(
        registry=mock_recognizer_registry,
        nlp_engine=NlpEngineMock(),
    )
    response = analyze_engine.get_recognizers(language="ru")
    # there is only 1 mocked russian recognizer
    assert len(response) == 1


def test_when_add_recognizer_then_also_outputs_others(spacy_nlp_engine):
    pattern = Pattern("rocket pattern", r"\W*(rocket)\W*", 0.8)
    pattern_recognizer = PatternRecognizer(
        "ROCKET",
        name="Rocket recognizer",
        patterns=[pattern],
        supported_language="en",
    )
    registry = RecognizerRegistry()
    registry.add_recognizer(pattern_recognizer)
    registry.load_predefined_recognizers()

    assert len(registry.recognizers) > 1

    analyzer = AnalyzerEngine(registry=registry, nlp_engine=spacy_nlp_engine)

    text = "Michael Jones has a rocket"

    results = analyzer.analyze(text=text, language="en")
    assert len(results) == 2


def test_when_given_no_decision_process_requested_then_response_contains_no_analysis(
    loaded_analyzer_engine, unit_test_guid
):
    text = "John Smith drivers license is AC432223"
    language = "en"
    return_decision_process = False
    results = loaded_analyzer_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        return_decision_process=return_decision_process,
        language=language,
    )

    assert len(results) == 1
    assert results[0].analysis_explanation is None


def test_given_decision_process_requested_then_response_contains_analysis(
    loaded_analyzer_engine, unit_test_guid
):
    text = "John Smith drivers license is AC432223"
    language = "en"
    return_decision_process = True
    results = loaded_analyzer_engine.analyze(
        correlation_id=unit_test_guid,
        text=text,
        return_decision_process=return_decision_process,
        language=language,
    )

    assert len(results) == 1
    assert results[0].analysis_explanation is not None


def test_when_read_test_spacy_nlp_conf_file_then_returns_spacy_nlp_engine(
    mock_registry,
):
    engine = AnalyzerEngine(registry=mock_registry)

    assert isinstance(engine.nlp_engine, SpacyNlpEngine)
    assert engine.nlp_engine.nlp is not None


def test_when_ad_hoc_pattern_recognizer_is_added_then_result_contains_result(
    loaded_analyzer_engine, zip_code_recognizer
):
    text = "John Smith drivers license is AC432223 and his zip code is 10023"

    responses = loaded_analyzer_engine.analyze(
        text=text, language="en", ad_hoc_recognizers=[zip_code_recognizer]
    )

    detected_entities = [response.entity_type for response in responses]
    assert "ZIP" in detected_entities


def test_when_ad_hoc_deny_list_recognizer_is_added_then_result_contains_result(
    loaded_analyzer_engine,
):
    text = "Mr. John Smith's drivers license is AC432223"

    mr_recognizer = PatternRecognizer(supported_entity="MR", deny_list=["Mr.", "Mr"])

    responses = loaded_analyzer_engine.analyze(
        text=text, language="en", ad_hoc_recognizers=[mr_recognizer]
    )

    detected_entities = [response.entity_type for response in responses]
    assert "MR" in detected_entities


def test_when_ad_hoc_deny_list_recognizer_is_added_then_result_does_not_persist(
    loaded_analyzer_engine,
):
    text = "Mr. John Smith's drivers license is AC432223"

    mr_recognizer = PatternRecognizer(supported_entity="MR", deny_list=["Mr.", "Mr"])

    responses1 = loaded_analyzer_engine.analyze(
        text=text, language="en", ad_hoc_recognizers=[mr_recognizer]
    )
    responses2 = loaded_analyzer_engine.analyze(text=text, language="en")

    detected_entities1 = [response.entity_type for response in responses1]
    assert "MR" in detected_entities1

    detected_entities2 = [response.entity_type for response in responses2]
    assert "MR" not in detected_entities2


def test_when_ad_hoc_deny_list_recognizer_contains_both_regex_and_deny_list(
    loaded_analyzer_engine, zip_code_deny_list_recognizer
):
    text = "Mr. John Smith's zip code is 10023 or 999"

    responses = loaded_analyzer_engine.analyze(
        text=text, language="en", ad_hoc_recognizers=[zip_code_deny_list_recognizer]
    )

    detected_zips = [
        response.entity_type for response in responses if response.entity_type == "ZIP"
    ]
    assert len(detected_zips) == 2


def test_entities_filter_for_ad_hoc_removes_recognizer(loaded_analyzer_engine):
    text = "Mr. John Smith's zip code is 10002"

    mr_recognizer = PatternRecognizer(supported_entity="MR", deny_list=["Mr.", "Mr"])
    responses1 = loaded_analyzer_engine.analyze(
        text=text, language="en", ad_hoc_recognizers=[mr_recognizer]
    )
    responses2 = loaded_analyzer_engine.analyze(
        text=text,
        language="en",
        ad_hoc_recognizers=[mr_recognizer],
        entities=["PERSON"],
    )

    assert "MR" in [resp.entity_type for resp in responses1]
    assert "MR" not in [resp.entity_type for resp in responses2]


def test_ad_hoc_with_context_support_higher_confidence(spacy_nlp_engine, zip_code_recognizer):
    text = "Mr. John Smith's zip code is 10023"
    analyzer_engine = AnalyzerEngine(nlp_engine=spacy_nlp_engine)

    responses1 = analyzer_engine.analyze(
        text=text, language="en", ad_hoc_recognizers=[zip_code_recognizer]
    )

    zip_code_recognizer.context = ["zip", "code"]
    responses2 = analyzer_engine.analyze(
        text=text, language="en", ad_hoc_recognizers=[zip_code_recognizer]
    )

    zip_result_no_context = [resp for resp in responses1 if resp.entity_type == "ZIP"]
    zip_result_with_context = [resp for resp in responses2 if resp.entity_type == "ZIP"]

    assert zip_result_no_context[0].score < zip_result_with_context[0].score


def test_ad_hoc_when_no_other_recognizers_are_requested_returns_only_ad_hoc_results(
    loaded_analyzer_engine, zip_code_recognizer
):
    text = "Mr. John Smith's zip code is 10023"

    responses = loaded_analyzer_engine.analyze(
        text=text,
        language="en",
        ad_hoc_recognizers=[zip_code_recognizer],
        entities=["ZIP"],
    )

    assert "ZIP" in [resp.entity_type for resp in responses]


def test_when_recognizer_doesnt_return_recognizer_name_no_exception(spacy_nlp_engine):
    class MockRecognizer1(EntityRecognizer, ABC):
        def analyze(self, text: str, entities: List[str], nlp_artifacts: NlpArtifacts):
            return [RecognizerResult("TEST1", 10, 30, 0.5)]

    class MockRecognizer2(EntityRecognizer, ABC):
        def analyze(self, text: str, entities: List[str], nlp_artifacts: NlpArtifacts):
            # pass lower score in mock due to sorting algorithm
            return [RecognizerResult("TEST2", 50, 60, 0.4)]

    mock_recognizer1 = MockRecognizer1(supported_entities=["TEST1"])
    mock_recognizer2 = MockRecognizer2(supported_entities=["TEST2"])

    registry = RecognizerRegistry()
    registry.add_recognizer(mock_recognizer1)
    registry.add_recognizer(mock_recognizer2)

    analyzer_engine = AnalyzerEngine(nlp_engine=spacy_nlp_engine, registry=registry)
    results = analyzer_engine.analyze("ABC", language="en")

    assert len(results) == 2

    assert results[0].entity_type == "TEST1"
    assert results[0].start == 10
    assert results[0].end == 30
    assert results[0].score == 0.5
    assert (
        results[0].recognition_metadata[RecognizerResult.RECOGNIZER_NAME_KEY]
        == "MockRecognizer1"
    )
    assert (
        "MockRecognizer1"
        in results[0].recognition_metadata[RecognizerResult.RECOGNIZER_IDENTIFIER_KEY]
    )

    assert results[1].entity_type == "TEST2"
    assert results[1].start == 50
    assert results[1].end == 60
    assert results[1].score == 0.4
    assert (
        results[1].recognition_metadata[RecognizerResult.RECOGNIZER_NAME_KEY]
        == "MockRecognizer2"
    )
    assert (
        "MockRecognizer2"
        in results[1].recognition_metadata[RecognizerResult.RECOGNIZER_IDENTIFIER_KEY]
    )


def test_when_recognizer_overrides_enhance_score_then_it_get_boosted_once(spacy_nlp_engine):
    class MockRecognizer(EntityRecognizer, ABC):
        def analyze(self, text: str, entities: List[str], nlp_artifacts: NlpArtifacts):
            return [
                RecognizerResult("TEST", 10, 30, 0.5),
                # pass lower score in mock due to sorting algorithm
                RecognizerResult("TEST", 50, 60, 0.4),
            ]

        def enhance_using_context(
            self,
            text: str,
            raw_recognizer_results: List[RecognizerResult],
            other_raw_recognizer_results: List[RecognizerResult],
            nlp_artifacts: NlpArtifacts,
            context: Optional[List[str]] = None,
        ) -> List[RecognizerResult]:
            results = copy.deepcopy(raw_recognizer_results)
            results[0].score += 0.4
            results[1].score += 0.4
            results[0].recognition_metadata[
                RecognizerResult.IS_SCORE_ENHANCED_BY_CONTEXT_KEY
            ] = True
            results[1].recognition_metadata[
                RecognizerResult.IS_SCORE_ENHANCED_BY_CONTEXT_KEY
            ] = True
            return results

    mock_recognizer = MockRecognizer(supported_entities=["TEST"])

    registry = RecognizerRegistry()
    registry.add_recognizer(mock_recognizer)

    analyzer_engine = AnalyzerEngine(nlp_engine=spacy_nlp_engine, registry=registry)
    recognizer_results = analyzer_engine.analyze("ABC", language="en")

    assert len(recognizer_results) == 2

    assert recognizer_results[0].entity_type == "TEST"
    assert recognizer_results[0].start == 10
    assert recognizer_results[0].end == 30
    assert recognizer_results[0].score == 0.9
    assert (
        recognizer_results[0].recognition_metadata[RecognizerResult.RECOGNIZER_NAME_KEY]
        == "MockRecognizer"
    )
    assert (
        "MockRecognizer"
        in recognizer_results[0].recognition_metadata[
            RecognizerResult.RECOGNIZER_IDENTIFIER_KEY
        ]
    )
    assert recognizer_results[0].recognition_metadata[
        RecognizerResult.IS_SCORE_ENHANCED_BY_CONTEXT_KEY
    ]
    assert recognizer_results[0].entity_type == "TEST"
    assert recognizer_results[1].start == 50
    assert recognizer_results[1].end == 60
    assert recognizer_results[1].score == 0.8
    assert (
        recognizer_results[1].recognition_metadata[RecognizerResult.RECOGNIZER_NAME_KEY]
        == "MockRecognizer"
    )
    assert (
        "MockRecognizer"
        in recognizer_results[1].recognition_metadata[
            RecognizerResult.RECOGNIZER_IDENTIFIER_KEY
        ]
    )
    assert recognizer_results[1].recognition_metadata[
        RecognizerResult.IS_SCORE_ENHANCED_BY_CONTEXT_KEY
    ]


def test_when_multiple_nameless_recognizers_context_is_correct(spacy_nlp_engine):
    rocket_recognizer = PatternRecognizer(
        supported_entity="ROCKET",
        context=["cool"],
        patterns=[Pattern("rocketpattern", r"(\W)(rocket)(\W)", 0.3)],
    )

    rocket_recognizer2 = PatternRecognizer(
        supported_entity="missile",
        context=["fast"],
        patterns=[Pattern("missilepattern", r"(\W)(missile)(\W)", 0.3)],
    )
    registry = RecognizerRegistry()
    registry.add_recognizer(rocket_recognizer)
    registry.add_recognizer(rocket_recognizer2)

    analyzer_engine = AnalyzerEngine(nlp_engine=spacy_nlp_engine, registry=registry)
    recognizer_results = analyzer_engine.analyze(
        "I have a cool rocket and a fast missile.", language="en"
    )

    for recognizer_result in recognizer_results:
        assert recognizer_result.score > 0.3
