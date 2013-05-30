<cfcomponent>
	<cffunction name="callRedMine" access="remote" returnType="any" returnFormat="plain" output="false">
		<cfargument name="callback" type="string" required="true">
		<cfargument name="redURL" type="string" required="true">
		<cfargument name="key" type="string" required="true">

		<cfset getURL = "https://popart.plan.io/" & arguments.redURL & ".json?include=journals">
		<cfhttp url="#getURL#" result="result">
			<cfhttpparam name="X-Redmine-API-Key" value="#arguments.key#" type="header">
			<cfhttpparam name="Content-Type" value="application/json" type="header">
		</cfhttp>
		<cfreturn arguments.callback & "(" & result.fileContent & ")">
	</cffunction>
</cfcomponent>
