from __future__ import annotations

import sys
from pathlib import Path

# Ensure project root is on sys.path
_PROJECT_ROOT = str(Path(__file__).resolve().parent.parent)
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

import types
import json
from dataclasses import dataclass
from typing import Any, Callable, Dict, Optional
import pytest


# ─────────────────────────────────────────────────────────────
# GenLayer In-Memory Mocks for AdAssure
# ─────────────────────────────────────────────────────────────

class Address(str):
    def __new__(cls, val):
        if isinstance(val, bytes):
            return super().__new__(cls, "0x" + val.hex())
        val_str = str(val)
        if not val_str.startswith("0x"):
            val_str = "0x" + val_str
        return super().__new__(cls, val_str)


class u256(int):
    def __new__(cls, val=0):
        v = int(val)
        if v < 0 or v >= 2**256:
            raise ValueError(f"u256 overflow: {v}")
        return super().__new__(cls, v)


class u64(int):
    def __new__(cls, val=0):
        v = int(val)
        if v < 0 or v >= 2**64:
            raise ValueError(f"u64 overflow: {v}")
        return super().__new__(cls, v)


class u32(int):
    def __new__(cls, val=0):
        v = int(val)
        if v < 0 or v >= 2**32:
            raise ValueError(f"u32 overflow: {v}")
        return super().__new__(cls, v)


class TreeMap(dict):
    pass


class Message:
    def __init__(self):
        self.sender_address = Address("0xBrand111111111111111111111111111111111111")
        self.value = 0


class NonDetWeb:
    def __init__(self):
        self.rendered_pages: Dict[str, str] = {}

    def render(self, url: str, mode: str = "text") -> str:
        return self.rendered_pages.get(url, f"Mocked webpage content for: {url}")


class NonDet:
    def __init__(self):
        self.web = NonDetWeb()
        self.prompt_responses: Dict[str, str] = {}
        self.default_prompt_response = json.dumps({
            "sponsor_link_found": True,
            "disclosure_found": True,
            "brand_safety_score": 90,
            "overall_passed": True,
            "compliance_notes": "Sponsor link and disclosure verified; content matches brief."
        })

    def exec_prompt(self, prompt: str, response_format: str = "json") -> str:
        for key, resp in self.prompt_responses.items():
            if key in prompt:
                return resp
        return self.default_prompt_response


class EqPrinciple:
    def strict_eq(self, fn: Callable[[], Any]) -> Any:
        return fn()


class GenLayerMock:
    def __init__(self):
        self.message = Message()
        self.nondet = NonDet()
        self.eq_principle = EqPrinciple()
        self.transfers = []

        class Public:
            class Write:
                def __call__(self, fn):
                    return fn
                def payable(self, fn):
                    return fn
            class View:
                def __call__(self, fn):
                    return fn

        self.public = Public()
        self.public.write = Public.Write()
        self.public.view = Public.View()

        class Contract:
            def __new__(cls, *args, **kwargs):
                instance = super().__new__(cls)
                for attr_name, attr_type in getattr(cls, "__annotations__", {}).items():
                    if "TreeMap" in str(attr_type):
                        setattr(instance, attr_name, TreeMap())
                return instance
        self.Contract = Contract

    def transfer(self, recipient: Any, amount: int):
        self.transfers.append((str(recipient), int(amount)))


def allow_storage(cls):
    return cls


# Install mock into sys.modules
gl_mock = GenLayerMock()
genlayer_module = types.ModuleType("genlayer")
genlayer_module.gl = gl_mock
genlayer_module.Address = Address
genlayer_module.u256 = u256
genlayer_module.u64 = u64
genlayer_module.u32 = u32
genlayer_module.TreeMap = TreeMap
genlayer_module.allow_storage = allow_storage

sys.modules["genlayer"] = genlayer_module


@pytest.fixture
def gl_env():
    gl_mock.transfers.clear()
    gl_mock.nondet.web.rendered_pages.clear()
    gl_mock.nondet.prompt_responses.clear()
    gl_mock.message.sender_address = Address("0xBrand111111111111111111111111111111111111")
    gl_mock.message.value = 0
    return gl_mock
