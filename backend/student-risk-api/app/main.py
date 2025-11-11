from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, StreamingResponse
import uvicorn
import pandas as pd
import os
from typing import List, Dict, Any, Optional
import io
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

# Create FastAPI instance with metadata
app = FastAPI(
    title="Student Risk API",
    description="API for student risk assessment",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Welcome to the Student Risk API",
        "status": "online",
        "documentation": "/docs"
    }

# Health check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}

# List all CSV files in the data directory
@app.get("/datasets", tags=["Data"])
def list_datasets():
    try:
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        if not os.path.exists(data_dir):
            return {"error": "Data directory not found", "available_datasets": []}
        
        csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
        return {"available_datasets": csv_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing datasets: {str(e)}")

# Get data from a specific CSV file
@app.get("/data/{filename}", tags=["Data"])
def get_dataset(filename: str, limit: int = 100):
    try:
        if not filename.endswith('.csv'):
            filename += '.csv'
            
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        file_path = os.path.join(data_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Dataset {filename} not found")
        
        # Read CSV file
        df = pd.read_csv(file_path)
        
        # Get basic info about the dataset
        info = {
            "filename": filename,
            "total_rows": len(df),
            "columns": list(df.columns),
        }
        
        # Return limited number of rows to prevent large responses
        data = df.head(limit).to_dict(orient="records")
        
        return {"info": info, "data": data}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error reading dataset: {str(e)}")

# Get summary statistics for a dataset
@app.get("/data/{filename}/stats", tags=["Data"])
def get_dataset_stats(filename: str):
    try:
        if not filename.endswith('.csv'):
            filename += '.csv'
            
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        file_path = os.path.join(data_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"Dataset {filename} not found")
        
        # Read CSV file
        df = pd.read_csv(file_path)
        
        # Generate summary statistics
        numeric_stats = df.describe().to_dict()
        
        # Count null values
        null_counts = df.isnull().sum().to_dict()
        
        # Get data types
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
        
        return {
            "filename": filename,
            "total_rows": len(df),
            "columns": list(df.columns),
            "numeric_stats": numeric_stats,
            "null_counts": null_counts,
            "dtypes": dtypes
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error analyzing dataset: {str(e)}")

# Helper function to load CSV data
def load_csv_data(filename: str):
    if not filename.endswith('.csv'):
        filename += '.csv'
        
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    file_path = os.path.join(data_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Dataset {filename} not found")
    
    # Read CSV file
    return pd.read_csv(file_path)

# Generate a chart from the dataset
@app.get("/data/{filename}/chart", tags=["Visualization"])
async def get_chart(
    filename: str, 
    chart_type: str = Query("bar", description="Type of chart (bar, line, scatter, hist, box, heatmap)"),
    x_column: str = Query(..., description="Column name for x-axis"),
    y_column: Optional[str] = Query(None, description="Column name for y-axis (not needed for histograms)"),
    hue_column: Optional[str] = Query(None, description="Column name for grouping (optional)"),
    title: str = Query("Chart", description="Chart title"),
    figsize_x: int = Query(10, description="Figure width"),
    figsize_y: int = Query(6, description="Figure height")
):
    try:
        df = load_csv_data(filename)
        
        # Validate columns
        if x_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{x_column}' not found in dataset")
        
        if y_column and y_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{y_column}' not found in dataset")
            
        if hue_column and hue_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Column '{hue_column}' not found in dataset")
        
        # Set up the figure
        plt.figure(figsize=(figsize_x, figsize_y))
        sns.set_style("whitegrid")
        
        # Create the appropriate chart
        if chart_type == "bar":
            if not y_column:
                raise HTTPException(status_code=400, detail="y_column is required for bar charts")
            ax = sns.barplot(x=x_column, y=y_column, hue=hue_column, data=df)
            
        elif chart_type == "line":
            if not y_column:
                raise HTTPException(status_code=400, detail="y_column is required for line charts")
            ax = sns.lineplot(x=x_column, y=y_column, hue=hue_column, data=df)
            
        elif chart_type == "scatter":
            if not y_column:
                raise HTTPException(status_code=400, detail="y_column is required for scatter plots")
            ax = sns.scatterplot(x=x_column, y=y_column, hue=hue_column, data=df)
            
        elif chart_type == "hist":
            ax = sns.histplot(df[x_column], kde=True)
            
        elif chart_type == "box":
            if not y_column:
                ax = sns.boxplot(x=x_column, data=df)
            else:
                ax = sns.boxplot(x=x_column, y=y_column, data=df)
                
        elif chart_type == "heatmap":
            # For heatmap, we need numerical data
            numeric_df = df.select_dtypes(include=['number'])
            if numeric_df.empty:
                raise HTTPException(status_code=400, detail="No numerical columns found for heatmap")
            
            corr = numeric_df.corr()
            ax = sns.heatmap(corr, annot=True, cmap="coolwarm")
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported chart type: {chart_type}")
        
        # Add title and labels
        plt.title(title)
        plt.tight_layout()
        
        # Save the figure to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format="png")
        buf.seek(0)
        plt.close()
        
        # Return the image as a response
        return StreamingResponse(buf, media_type="image/png")
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error generating chart: {str(e)}")

# Generate an HTML dashboard with multiple charts
@app.get("/data/{filename}/dashboard", response_class=HTMLResponse, tags=["Visualization"])
async def get_dashboard(filename: str):
    try:
        df = load_csv_data(filename)
        
        # Generate HTML for a dashboard
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dashboard for {filename}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .dashboard {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }}
                .chart-container {{ border: 1px solid #ddd; border-radius: 5px; padding: 10px; }}
                h1, h2 {{ color: #333; }}
                .summary {{ margin-bottom: 20px; }}
            </style>
        </head>
        <body>
            <h1>Dashboard for {filename}</h1>
            
            <div class="summary">
                <h2>Dataset Summary</h2>
                <p>Total rows: {len(df)}</p>
                <p>Total columns: {len(df.columns)}</p>
                <p>Columns: {', '.join(df.columns)}</p>
            </div>
            
            <div class="dashboard">
        """
        
        # Get numeric columns for charts
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        # Add charts to the dashboard
        if len(numeric_cols) >= 2:
            # Add a scatter plot of the first two numeric columns
            html_content += f"""
                <div class="chart-container">
                    <h2>Scatter Plot</h2>
                    <img src="/data/{filename}/chart?chart_type=scatter&x_column={numeric_cols[0]}&y_column={numeric_cols[1]}&title=Scatter%20Plot" width="100%">
                </div>
            """
        
        if numeric_cols:
            # Add a histogram of the first numeric column
            html_content += f"""
                <div class="chart-container">
                    <h2>Histogram</h2>
                    <img src="/data/{filename}/chart?chart_type=hist&x_column={numeric_cols[0]}&title=Distribution%20of%20{numeric_cols[0]}" width="100%">
                </div>
            """
        
        if len(numeric_cols) >= 2:
            # Add a correlation heatmap
            html_content += f"""
                <div class="chart-container">
                    <h2>Correlation Heatmap</h2>
                    <img src="/data/{filename}/chart?chart_type=heatmap&x_column={numeric_cols[0]}&title=Correlation%20Matrix" width="100%">
                </div>
            """
        
        if categorical_cols and numeric_cols:
            # Add a bar chart
            html_content += f"""
                <div class="chart-container">
                    <h2>Bar Chart</h2>
                    <img src="/data/{filename}/chart?chart_type=bar&x_column={categorical_cols[0]}&y_column={numeric_cols[0]}&title=Bar%20Chart" width="100%">
                </div>
            """
        
        # Close the HTML
        html_content += """
            </div>
        </body>
        </html>
        """
        
        return html_content
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error generating dashboard: {str(e)}")

# Add this if you want to run the app directly with python main.py
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)