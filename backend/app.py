from flask import Flask, jsonify, request
from flask_cors import CORS

from dotenv import load_dotenv
import os
from langchain.vectorstores import FAISS
from langchain_community.embeddings import OctoAIEmbeddings
from langchain_community.llms.octoai_endpoint import OctoAIEndpoint
from langchain.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

app = Flask(__name__)
CORS(app)

story = ""

def run_llm_model(p_url, p_prompt):

    load_dotenv()
    OCTOAI_API_TOKEN = os.environ["OCTOAI_API_TOKEN"]

    from langchain_text_splitters import RecursiveCharacterTextSplitter, HTMLHeaderTextSplitter

    headers_to_split_on = [
        ("h1", "Header 1"),
        ("h2", "Header 2"),
        ("h3", "Header 3"),
        ("h4", "Header 4"),
        ("div", "Divider")
    ]

    html_splitter = HTMLHeaderTextSplitter(headers_to_split_on=headers_to_split_on)

    chunk_size = 1024
    chunk_overlap = 128
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )

    # for local file use html_splitter.split_text_from_file(<path_to_file>)
    url = p_url
    html_header_splits = html_splitter.split_text_from_url(url)

    # Split
    splits = text_splitter.split_documents(html_header_splits)

    llm = OctoAIEndpoint(
            model="llama-2-13b-chat-fp16",
            max_tokens=1024,
            presence_penalty=-0.2,
            frequency_penalty=0.8,
            temperature=0.5,
            top_p=0.9,  
        )
    embeddings = OctoAIEmbeddings()

    vector_store = FAISS.from_documents(
        splits,
        embedding=embeddings
    )
    splits_story = text_splitter.split_text(story)
    vector_store_story = FAISS.from_texts(
        splits_story,
        embedding=embeddings
    )

    retriever = vector_store.as_retriever()
    story_retriever = vector_store_story.as_retriever()

    if (story != ""):
        template="""You are a creative storyteller helping weave a story. Continue the 'Story' using 'Hint', you can use 'Context' if present. Use three sentences maximum and keep the answer concise. Do not mention anything else other than the story.
        Hint: {hint} 
        Context: {context}
        Story: {story_retriever} 
        Answer:"""
    else:
        template="""You are a creative storyteller helping start a story weaving session. Create the start of 'Story' using 'Hint', you can use 'Context' if present. Use three sentences maximum and keep the answer concise.
        Hint: {hint} 
        Context: {context}
        Answer:"""
    prompt = ChatPromptTemplate.from_template(template)


    chain = (
        {"context": retriever, "story_retriever":story_retriever, "hint": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    buffer_response = chain.invoke(p_prompt)
    print(buffer_response)

    story = story + buffer_response
    print(story)


@app.route('/api/greet', methods=['GET'])
def greet():
    name = request.args.get('name', 'World')
    return jsonify({"message": f"Hello, {name}!"})

@app.route('/api/solve', methods=['POST'])
def solve():
    data = request.get_json()
    ref = data.get('ref', '')
    prompt = data.get('prompt', '')
    # Implement your solution logic here
    solution = f"{run_llm_model(ref, prompt)}"
    return jsonify({"solution": solution})

if __name__ == '__main__':
    app.run(debug=True)
