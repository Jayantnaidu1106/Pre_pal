import sys
try:
    import langchain
    import langchain.chains
    print(f"LangChain Path: {langchain.__file__}")
    print(f"Chains Path: {langchain.chains.__file__}")
    print("Available attributes in langchain.chains:")
    print(dir(langchain.chains))
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")
