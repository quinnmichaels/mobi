<cfcomponent>
	<cffunction name="callRedMine" access="remote" returnType="any" returnFormat="plain" output="false">
		<cfargument name="callback" type="string" required="true">
		<cfargument name="redURL" type="string" required="true">
		<cfargument name="key" type="string" required="true">

		<cfhttp url="#arguments.redURL#" result="result">
			<cfhttpparam name="X-Redmine-API-Key" value="#arguments.key#" type="header">
			<cfhttpparam name="Content-Type" value="application/json" type="header">
		</cfhttp>
		<cfreturn arguments.callback & "(" & result.fileContent & ")">
	</cffunction>
</cfcomponent>
